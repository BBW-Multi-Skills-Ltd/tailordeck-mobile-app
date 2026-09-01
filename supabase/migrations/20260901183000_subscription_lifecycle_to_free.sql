set check_function_bodies = off;

create or replace function public.refresh_current_subscription_lifecycle()
returns public.subscriptions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = current_user_id
  for update;

  if current_subscription.id is null then
    return null;
  end if;

  if current_subscription.plan_name = 'free' and current_subscription.status <> 'active' then
    update public.subscriptions
    set
      status = 'active',
      cancel_at_period_end = false,
      current_period_ends_at = null,
      updated_at = now()
    where id = current_subscription.id
    returning * into current_subscription;
  elsif current_subscription.plan_name in ('starter', 'pro')
    and (
      current_subscription.status in ('expired', 'past_due')
      or (
        current_subscription.current_period_ends_at is not null
        and current_subscription.current_period_ends_at <= now()
      )
    ) then
    update public.subscriptions
    set
      plan_name = 'free',
      status = 'active',
      billing_cycle = 'monthly',
      cancel_at_period_end = false,
      current_period_ends_at = null,
      payment_status = 'none',
      pending_payment_reference = null,
      paystack_subscription_code = null,
      paystack_email_token = null,
      paystack_plan_code = null,
      updated_at = now()
    where id = current_subscription.id
    returning * into current_subscription;
  elsif current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status = 'cancelled'
    and current_subscription.current_period_ends_at is not null
    and current_subscription.current_period_ends_at > now() then
    update public.subscriptions
    set
      status = 'active',
      cancel_at_period_end = true,
      updated_at = now()
    where id = current_subscription.id
    returning * into current_subscription;
  end if;

  return current_subscription;
end;
$$;

create or replace function public.process_due_subscription_downgrades(batch_limit integer default 500)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  changed_count integer := 0;
begin
  with due as (
    select id
    from public.subscriptions
    where plan_name in ('starter', 'pro')
      and (
        status in ('expired', 'past_due')
        or (
          current_period_ends_at is not null
          and current_period_ends_at <= now()
        )
      )
    order by current_period_ends_at nulls last, updated_at
    limit greatest(1, least(coalesce(batch_limit, 500), 5000))
  ), updated as (
    update public.subscriptions s
    set
      plan_name = 'free',
      status = 'active',
      billing_cycle = 'monthly',
      cancel_at_period_end = false,
      current_period_ends_at = null,
      payment_status = 'none',
      pending_payment_reference = null,
      paystack_subscription_code = null,
      paystack_email_token = null,
      paystack_plan_code = null,
      updated_at = now()
    from due
    where s.id = due.id
    returning s.id
  )
  select count(*)::integer into changed_count from updated;

  return changed_count;
end;
$$;

create or replace function public.get_effective_subscription_state()
returns table (
  subscription_id uuid,
  subscription_plan text,
  subscription_status text,
  effective_plan text,
  trial_active boolean,
  trial_ends_at timestamp with time zone,
  current_period_ends_at timestamp with time zone,
  cancel_at_period_end boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  current_subscription public.subscriptions%rowtype;
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
  is_paid_active boolean := false;
  is_paid_ended boolean := false;
begin
  if auth.uid() is null then
    return;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = auth.uid()
  limit 1;

  if current_subscription.id is null then
    return;
  end if;

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
  is_trial_active := current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end > now();

  is_paid_active := current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status in ('active', 'cancelled')
    and (
      current_subscription.current_period_ends_at is null
      or current_subscription.current_period_ends_at > now()
    );

  is_paid_ended := current_subscription.plan_name in ('starter', 'pro')
    and (
      current_subscription.status in ('expired', 'past_due')
      or (
        current_subscription.current_period_ends_at is not null
        and current_subscription.current_period_ends_at <= now()
      )
    );

  return query
  select
    current_subscription.id,
    current_subscription.plan_name,
    current_subscription.status,
    case
      when is_trial_active then 'trial'
      when is_paid_active then current_subscription.plan_name
      when current_subscription.plan_name = 'free' and current_subscription.status = 'active' then 'free'
      when is_paid_ended then 'free'
      else 'inactive'
    end,
    is_trial_active,
    trial_end,
    current_subscription.current_period_ends_at,
    current_subscription.cancel_at_period_end;
end;
$$;

create or replace function public.has_feature_access(feature_key_value text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_subscription public.subscriptions%rowtype;
  effective_plan_name text;
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
  is_paid_active boolean := false;
  is_paid_ended boolean := false;
begin
  if auth.uid() is null then
    return false;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = auth.uid()
  limit 1;

  if current_subscription.id is null then
    return false;
  end if;

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
  is_trial_active := current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end > now();

  is_paid_active := current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status in ('active', 'cancelled')
    and (
      current_subscription.current_period_ends_at is null
      or current_subscription.current_period_ends_at > now()
    );

  is_paid_ended := current_subscription.plan_name in ('starter', 'pro')
    and (
      current_subscription.status in ('expired', 'past_due')
      or (
        current_subscription.current_period_ends_at is not null
        and current_subscription.current_period_ends_at <= now()
      )
    );

  effective_plan_name := case
    when is_trial_active then 'trial'
    when is_paid_active then current_subscription.plan_name
    when current_subscription.plan_name = 'free' and current_subscription.status = 'active' then 'free'
    when is_paid_ended then 'free'
    else null
  end;

  if effective_plan_name is null then
    return false;
  end if;

  if effective_plan_name = 'trial' then
    return exists (
      select 1
      from public.plan_features
      where feature_key = feature_key_value
        and plan_name = 'pro'
        and is_enabled = true
    );
  end if;

  return exists (
    select 1
    from public.plan_features
    where plan_name = effective_plan_name
      and feature_key = feature_key_value
      and is_enabled = true
  );
end;
$$;

create or replace function public.get_job_creation_entitlement()
returns table (
  effective_plan text,
  jobs_used integer,
  job_limit integer,
  can_create_job boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions%rowtype;
  current_jobs_used integer := 0;
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
  is_paid_active boolean := false;
  is_paid_ended boolean := false;
  effective_plan_name text := 'inactive';
begin
  if current_user_id is null then
    return query select 'inactive'::text, 0::integer, null::integer, false;
    return;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = current_user_id
  limit 1;

  if current_subscription.id is null then
    return query select 'inactive'::text, 0::integer, null::integer, false;
    return;
  end if;

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
  is_trial_active := current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end > now();

  is_paid_active := current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status in ('active', 'cancelled')
    and (
      current_subscription.current_period_ends_at is null
      or current_subscription.current_period_ends_at > now()
    );

  is_paid_ended := current_subscription.plan_name in ('starter', 'pro')
    and (
      current_subscription.status in ('expired', 'past_due')
      or (
        current_subscription.current_period_ends_at is not null
        and current_subscription.current_period_ends_at <= now()
      )
    );

  select count(*)::integer
  into current_jobs_used
  from public.jobs
  where user_id = current_user_id
    and deleted_at is null;

  effective_plan_name := case
    when is_trial_active then 'trial'
    when is_paid_active then current_subscription.plan_name
    when current_subscription.plan_name = 'free' and current_subscription.status = 'active' then 'free'
    when is_paid_ended then 'free'
    else 'inactive'
  end;

  if effective_plan_name in ('trial', 'starter', 'pro') then
    return query select effective_plan_name, current_jobs_used, null::integer, true;
    return;
  end if;

  if effective_plan_name = 'free' then
    return query select effective_plan_name, current_jobs_used, 3::integer, current_jobs_used < 3;
    return;
  end if;

  return query select effective_plan_name, current_jobs_used, null::integer, false;
end;
$$;

create or replace function public.enforce_free_plan_job_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_subscription public.subscriptions%rowtype;
  existing_job_count integer := 0;
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
  is_paid_active boolean := false;
  is_paid_ended boolean := false;
  effective_plan_name text := 'inactive';
begin
  if new.deleted_at is not null then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.deleted_at is null and old.user_id = new.user_id then
    return new;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = new.user_id
  limit 1;

  if current_subscription.id is null then
    raise exception 'An active subscription is required to create jobs.';
  end if;

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
  is_trial_active := current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end > now();

  is_paid_active := current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status in ('active', 'cancelled')
    and (
      current_subscription.current_period_ends_at is null
      or current_subscription.current_period_ends_at > now()
    );

  is_paid_ended := current_subscription.plan_name in ('starter', 'pro')
    and (
      current_subscription.status in ('expired', 'past_due')
      or (
        current_subscription.current_period_ends_at is not null
        and current_subscription.current_period_ends_at <= now()
      )
    );

  effective_plan_name := case
    when is_trial_active then 'trial'
    when is_paid_active then current_subscription.plan_name
    when current_subscription.plan_name = 'free' and current_subscription.status = 'active' then 'free'
    when is_paid_ended then 'free'
    else 'inactive'
  end;

  if effective_plan_name in ('trial', 'starter', 'pro') then
    return new;
  end if;

  if effective_plan_name = 'free' then
    select count(*)::integer
    into existing_job_count
    from public.jobs
    where user_id = new.user_id
      and deleted_at is null
      and id <> new.id;

    if existing_job_count >= 3 then
      raise exception 'Free plan job limit reached. Upgrade to Starter to create more jobs.';
    end if;

    return new;
  end if;

  raise exception 'Your current plan cannot create jobs right now.';
end;
$$;

create or replace function public.get_dashboard_monthly_stats(month_count integer default 6)
returns table (
  month text,
  jobs integer,
  revenue_kobo bigint,
  expenses_kobo bigint,
  profit_kobo bigint
)
language plpgsql
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
      date_trunc('month', j.created_at)::date as month_start,
      count(*)::integer as jobs,
      coalesce(sum(j.charge_amount_kobo), 0)::bigint as revenue_kobo,
      coalesce(sum(j.total_expenses_kobo), 0)::bigint as expenses_kobo,
      coalesce(sum(coalesce(j.profit_kobo, j.charge_amount_kobo - j.total_expenses_kobo)), 0)::bigint as profit_kobo
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
$$;

create or replace function public.get_dashboard_status_breakdown()
returns table (
  completed integer,
  in_progress integer,
  pending integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.has_feature_access('dashboard_analytics') then
    raise exception 'Dashboard analytics are available on Pro.';
  end if;

  return query
  select
    count(*) filter (where j.status = 'completed')::integer as completed,
    count(*) filter (where j.status = 'in_progress')::integer as in_progress,
    count(*) filter (where j.status = 'pending')::integer as pending
  from public.jobs j
  where j.user_id = auth.uid()
    and j.deleted_at is null
    and j.status <> 'draft';
end;
$$;

create or replace function public.get_dashboard_status_breakdown(month_key text default null)
returns table (
  completed integer,
  in_progress integer,
  pending integer
)
language plpgsql
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
    count(*) filter (where j.status = 'completed')::integer as completed,
    count(*) filter (where j.status = 'in_progress')::integer as in_progress,
    count(*) filter (where j.status = 'pending')::integer as pending
  from public.jobs j, parsed_month
  where j.user_id = auth.uid()
    and j.deleted_at is null
    and j.status <> 'draft'
    and (
      parsed_month.month_start is null
      or (
        j.created_at >= parsed_month.month_start
        and j.created_at < (parsed_month.month_start + interval '1 month')
      )
    );
end;
$$;

revoke all privileges on function public.refresh_current_subscription_lifecycle() from public, anon, authenticated;
revoke all privileges on function public.process_due_subscription_downgrades(integer) from public, anon, authenticated;
revoke all privileges on function public.get_effective_subscription_state() from public, anon, authenticated;
revoke all privileges on function public.has_feature_access(text) from public, anon, authenticated;
revoke all privileges on function public.get_job_creation_entitlement() from public, anon, authenticated;
revoke all privileges on function public.enforce_free_plan_job_limit() from public, anon, authenticated;
revoke all privileges on function public.get_dashboard_monthly_stats(integer) from public, anon, authenticated;
revoke all privileges on function public.get_dashboard_status_breakdown() from public, anon, authenticated;
revoke all privileges on function public.get_dashboard_status_breakdown(text) from public, anon, authenticated;

grant execute on function public.refresh_current_subscription_lifecycle() to authenticated;
grant execute on function public.get_effective_subscription_state() to authenticated;
grant execute on function public.has_feature_access(text) to authenticated;
grant execute on function public.get_job_creation_entitlement() to authenticated;
grant execute on function public.process_due_subscription_downgrades(integer) to service_role;
grant execute on function public.get_dashboard_monthly_stats(integer) to authenticated;
grant execute on function public.get_dashboard_status_breakdown() to authenticated;
grant execute on function public.get_dashboard_status_breakdown(text) to authenticated;
