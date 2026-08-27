set check_function_bodies = off;

create or replace function public.enforce_document_feature_access()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null or actor_id <> new.user_id then
    raise exception 'Authentication required to create or update documents.';
  end if;

  if public.has_feature_access('document_sending') or public.has_feature_access('pdf_export') then
    return new;
  end if;

  raise exception 'This document feature is available on Pro. Upgrade to send or export PDFs.';
end;
$$;

drop trigger if exists enforce_document_feature_access on public.documents;
create trigger enforce_document_feature_access
  before insert or update of storage_path, file_name, mime_type, size_bytes, sent_at, shared_at, sent_via_whatsapp
  on public.documents
  for each row
  execute function public.enforce_document_feature_access();

revoke all on function public.enforce_document_feature_access() from public;
revoke all on function public.enforce_document_feature_access() from anon;
revoke all on function public.enforce_document_feature_access() from authenticated;

create or replace function public.get_dashboard_monthly_stats(month_count integer default 6)
returns table (
  month text,
  jobs integer,
  revenue_kobo bigint,
  expenses_kobo bigint,
  profit_kobo bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
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
      date_trunc('month', created_at)::date as month_start,
      count(*)::integer as jobs,
      coalesce(sum(charge_amount_kobo), 0)::bigint as revenue_kobo,
      coalesce(sum(total_expenses_kobo), 0)::bigint as expenses_kobo,
      coalesce(sum(coalesce(profit_kobo, charge_amount_kobo - total_expenses_kobo)), 0)::bigint as profit_kobo
    from public.jobs
    where user_id = auth.uid()
      and deleted_at is null
      and status <> 'draft'
      and created_at >= date_trunc('month', now()) - (((select safe_month_count from bounds) - 1) || ' months')::interval
    group by date_trunc('month', created_at)::date
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
$$;

create or replace function public.get_dashboard_status_breakdown()
returns table (
  completed integer,
  in_progress integer,
  pending integer
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.has_feature_access('dashboard_analytics') then
    raise exception 'Dashboard analytics are available on Pro.';
  end if;

  return query
  select
    count(*) filter (where status = 'completed')::integer as completed,
    count(*) filter (where status = 'in_progress')::integer as in_progress,
    count(*) filter (where status = 'pending')::integer as pending
  from public.jobs
  where user_id = auth.uid()
    and deleted_at is null
    and status <> 'draft';
end;
$$;

create or replace function public.get_dashboard_status_breakdown(month_key text default null)
returns table (
  completed integer,
  in_progress integer,
  pending integer
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.has_feature_access('dashboard_analytics') then
    raise exception 'Dashboard analytics are available on Pro.';
  end if;

  return query
  with parsed_month as (
    select
      case
        when month_key ~ '^\d{4}-\d{2}$' then to_date(month_key || '-01', 'YYYY-MM-DD')
        else null
      end as month_start
  )
  select
    count(*) filter (where status = 'completed')::integer as completed,
    count(*) filter (where status = 'in_progress')::integer as in_progress,
    count(*) filter (where status = 'pending')::integer as pending
  from public.jobs, parsed_month
  where user_id = auth.uid()
    and deleted_at is null
    and status <> 'draft'
    and (
      parsed_month.month_start is null
      or (
        created_at >= parsed_month.month_start
        and created_at < (parsed_month.month_start + interval '1 month')
      )
    );
end;
$$;

revoke all on function public.get_dashboard_monthly_stats(integer) from public, anon, authenticated;
revoke all on function public.get_dashboard_status_breakdown() from public, anon, authenticated;
revoke all on function public.get_dashboard_status_breakdown(text) from public, anon, authenticated;
grant execute on function public.get_dashboard_monthly_stats(integer) to authenticated;
grant execute on function public.get_dashboard_status_breakdown() to authenticated;
grant execute on function public.get_dashboard_status_breakdown(text) to authenticated;
