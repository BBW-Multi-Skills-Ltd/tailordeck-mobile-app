-- Clean-up of unused schema (docs/09-Code-Cleanup-Review.md, batch 7).
--
-- ORDER MATTERS: deploy the Edge Functions from the same change first. The old google-play-* functions still
-- write subscriptions.current_period_end, which this migration drops.
--
-- Not included (needs a product decision): jobs.balance_amount_kobo. It is never written, so the
-- "Balance to collect" notification in notify_job_after_insert never fires.

-- 1. Dashboard RPCs: profit_kobo is never written, so coalesce(profit_kobo, charge - expenses) always used
--    charge - expenses. Same results, without the dropped column.
create or replace function public.get_dashboard_monthly_stats(month_count integer default 6)
returns table(month text, jobs integer, revenue_kobo bigint, expenses_kobo bigint, profit_kobo bigint)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if auth.uid() is null or not public.has_feature_access('dashboard_analytics') then
    raise exception 'Dashboard analytics are available on Pro.';
  end if;

  return query
  with bounds as (
    select greatest(1, least(coalesce(month_count, 6), 24)) as safe_month_count
  ), months as (
    select generate_series(
      date_trunc('month', now()) - ((safe_month_count - 1) || ' months')::interval,
      date_trunc('month', now()),
      interval '1 month'
    )::date as month_start
    from bounds
  ), job_rollup as (
    select
      date_trunc('month', j.created_at)::date as month_start,
      count(*)::integer as jobs,
      coalesce(sum(j.charge_amount_kobo), 0)::bigint as revenue_kobo,
      coalesce(sum(j.total_expenses_kobo), 0)::bigint as expenses_kobo,
      coalesce(sum(j.charge_amount_kobo - j.total_expenses_kobo), 0)::bigint as profit_kobo
    from public.jobs j
    where j.user_id = auth.uid()
      and j.deleted_at is null
      and j.status <> 'draft'
      and j.created_at >= date_trunc('month', now()) - (((select safe_month_count from bounds) - 1) || ' months')::interval
    group by date_trunc('month', j.created_at)::date
  )
  select
    to_char(months.month_start, 'YYYY-MM') as month,
    coalesce(job_rollup.jobs, 0) as jobs,
    coalesce(job_rollup.revenue_kobo, 0) as revenue_kobo,
    coalesce(job_rollup.expenses_kobo, 0) as expenses_kobo,
    coalesce(job_rollup.profit_kobo, 0) as profit_kobo
  from months
  left join job_rollup using (month_start)
  order by months.month_start;
end;
$function$;

create or replace function public.get_home_current_month_summary()
returns table(month text, jobs integer, revenue_kobo bigint, expenses_kobo bigint, profit_kobo bigint)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  return query
  select
    to_char(date_trunc('month', now()), 'YYYY-MM') as month,
    count(j.id)::integer as jobs,
    coalesce(sum(j.charge_amount_kobo), 0)::bigint as revenue_kobo,
    coalesce(sum(j.total_expenses_kobo), 0)::bigint as expenses_kobo,
    coalesce(sum(j.charge_amount_kobo - j.total_expenses_kobo), 0)::bigint as profit_kobo
  from public.jobs j
  where j.user_id = auth.uid()
    and j.deleted_at is null
    and j.status <> 'draft'
    and j.created_at >= date_trunc('month', now())
    and j.created_at < date_trunc('month', now()) + interval '1 month';
end;
$function$;

-- 2. Columns that nothing writes or reads.
alter table public.jobs
  drop column if exists profit_kobo,
  drop column if exists worth_it_note,
  drop column if exists custom_material_type,
  drop column if exists notes;

-- Duplicate of current_period_ends_at (the only one the code reads).
alter table public.subscriptions drop column if exists current_period_end;

-- Admin rights live in admin_users; profiles.role was unused and users could set it to 'admin' (SEC-01).
alter table public.profiles drop column if exists role;

-- 3. Duplicate policy (same rule as "Users can read own subscription").
drop policy if exists "Users can view own subscription" on public.subscriptions;

-- 4. Legacy RPC the app no longer calls; it let users flip cancel_at_period_end on paid plans (SEC-09).
drop function if exists public.set_subscription_cancel_at_period_end(boolean);

-- 5. All feature keys the signed-in user has, in one call (replaces one has_feature_access call per feature).
--    Same rules as has_feature_access: a trial gets the Pro features.
create or replace function public.get_my_enabled_features()
returns text[]
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  plan text;
begin
  if auth.uid() is null then
    return array[]::text[];
  end if;

  select effective_plan into plan from public.get_effective_subscription_state() limit 1;
  if plan is null or plan = 'inactive' then
    return array[]::text[];
  end if;

  return coalesce(
    (
      select array_agg(feature_key order by feature_key)
      from public.plan_features
      where plan_name = case when plan = 'trial' then 'pro' else plan end
        and is_enabled = true
    ),
    array[]::text[]
  );
end;
$function$;

revoke all on function public.get_my_enabled_features() from public, anon;
grant execute on function public.get_my_enabled_features() to authenticated;
