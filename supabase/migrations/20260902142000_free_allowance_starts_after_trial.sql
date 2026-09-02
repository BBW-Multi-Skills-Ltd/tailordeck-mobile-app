set check_function_bodies = off;

alter table public.subscriptions
  add column if not exists free_started_at timestamp with time zone;

comment on column public.subscriptions.free_started_at is
  'Timestamp when the account entered permanent Free plan allowance. Trial/paid jobs before this timestamp do not count against the Free job limit.';

-- Existing expired Free users should receive a fresh Free allowance from this migration moment.
update public.subscriptions
set free_started_at = now(),
    updated_at = now()
where plan_name = 'free'
  and status = 'active'
  and free_started_at is null
  and coalesce(tester_trial_ends_at, trial_ends_at) is not null
  and coalesce(tester_trial_ends_at, trial_ends_at) <= now();

create or replace function public.refresh_current_subscription_lifecycle()
returns public.subscriptions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions%rowtype;
  trial_end timestamp with time zone;
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

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);

  if current_subscription.plan_name = 'free' and current_subscription.status <> 'active' then
    update public.subscriptions
    set
      status = 'active',
      cancel_at_period_end = false,
      current_period_ends_at = null,
      free_started_at = coalesce(free_started_at, now()),
      updated_at = now()
    where id = current_subscription.id
    returning * into current_subscription;
  elsif current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end <= now()
    and current_subscription.free_started_at is null then
    update public.subscriptions
    set
      free_started_at = now(),
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
      free_started_at = coalesce(current_subscription.current_period_ends_at, now()),
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
    select id, current_period_ends_at
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
      free_started_at = coalesce(due.current_period_ends_at, now()),
      updated_at = now()
    from due
    where s.id = due.id
    returning s.id
  )
  select count(*)::integer into changed_count from updated;

  return changed_count;
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
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions%rowtype;
  current_jobs_used integer := 0;
  trial_end timestamp with time zone;
  free_start timestamp with time zone;
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
  for update;

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

  effective_plan_name := case
    when is_trial_active then 'trial'
    when is_paid_active then current_subscription.plan_name
    when current_subscription.plan_name = 'free' and current_subscription.status = 'active' then 'free'
    when is_paid_ended then 'free'
    else 'inactive'
  end;

  if effective_plan_name in ('trial', 'starter', 'pro') then
    select count(*)::integer
    into current_jobs_used
    from public.jobs
    where user_id = current_user_id
      and deleted_at is null;

    return query select effective_plan_name, current_jobs_used, null::integer, true;
    return;
  end if;

  if effective_plan_name = 'free' then
    free_start := current_subscription.free_started_at;

    if free_start is null then
      free_start := case
        when is_paid_ended then coalesce(current_subscription.current_period_ends_at, now())
        else now()
      end;

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
        free_started_at = free_start,
        updated_at = now()
      where id = current_subscription.id;
    end if;

    select count(*)::integer
    into current_jobs_used
    from public.jobs
    where user_id = current_user_id
      and deleted_at is null
      and created_at >= free_start;

    return query select effective_plan_name, current_jobs_used, 3::integer, current_jobs_used < 3;
    return;
  end if;

  return query select effective_plan_name, 0::integer, null::integer, false;
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
  free_start timestamp with time zone;
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
  for update;

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
    free_start := current_subscription.free_started_at;

    if free_start is null then
      free_start := case
        when is_paid_ended then coalesce(current_subscription.current_period_ends_at, now())
        else now()
      end;

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
        free_started_at = free_start,
        updated_at = now()
      where id = current_subscription.id;
    end if;

    select count(*)::integer
    into existing_job_count
    from public.jobs
    where user_id = new.user_id
      and deleted_at is null
      and created_at >= free_start
      and id <> new.id;

    if existing_job_count >= 3 then
      raise exception 'Free plan job limit reached. Upgrade to Starter to create more jobs.';
    end if;

    return new;
  end if;

  raise exception 'Your current plan cannot create jobs right now.';
end;
$$;

revoke all privileges on function public.refresh_current_subscription_lifecycle() from public, anon, authenticated;
revoke all privileges on function public.process_due_subscription_downgrades(integer) from public, anon, authenticated;
revoke all privileges on function public.get_job_creation_entitlement() from public, anon, authenticated;
revoke all privileges on function public.enforce_free_plan_job_limit() from public, anon, authenticated;

grant execute on function public.refresh_current_subscription_lifecycle() to authenticated;
grant execute on function public.get_job_creation_entitlement() to authenticated;
grant execute on function public.process_due_subscription_downgrades(integer) to service_role;

