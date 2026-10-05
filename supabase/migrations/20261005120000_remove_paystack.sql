-- Remove Paystack: TailorDeck bills only through Google Play now.
-- Rewrites the downgrade-to-free functions without the Paystack column resets, then drops the columns.

CREATE OR REPLACE FUNCTION public.refresh_current_subscription_lifecycle()
 RETURNS subscriptions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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

    perform public.notify_trial_expired_once(current_user_id, coalesce(trial_end, current_subscription.free_started_at));
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

    perform public.notify_trial_expired_once(current_user_id, trial_end);
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
$function$;

CREATE OR REPLACE FUNCTION public.process_due_subscription_downgrades(batch_limit integer DEFAULT 500)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
      free_started_at = coalesce(due.current_period_ends_at, now()),
      updated_at = now()
    from due
    where s.id = due.id
    returning s.id
  )
  select count(*)::integer into changed_count from updated;

  return changed_count;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_job_creation_entitlement()
 RETURNS TABLE(effective_plan text, jobs_used integer, job_limit integer, can_create_job boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.enforce_free_plan_job_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

alter table public.subscriptions
  drop constraint if exists subscriptions_billing_provider_check;

update public.subscriptions set billing_provider = 'internal' where billing_provider = 'paystack';

alter table public.subscriptions
  add constraint subscriptions_billing_provider_check
  check (billing_provider in ('internal', 'google_play'));

alter table public.subscriptions
  drop column if exists pending_payment_reference,
  drop column if exists last_payment_reference,
  drop column if exists last_payment_at,
  drop column if exists paystack_customer_code,
  drop column if exists paystack_subscription_code,
  drop column if exists paystack_email_token,
  drop column if exists paystack_plan_code;

-- Replaces the Paystack cancellation edge function for free trials. Paid plans are cancelled in Google Play.
create or replace function public.set_free_trial_cancellation(cancel_at_period_end_value boolean)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_subscription public.subscriptions;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  update public.subscriptions
  set cancel_at_period_end = cancel_at_period_end_value,
      updated_at = now()
  where user_id = auth.uid()
    and plan_name = 'free'
  returning * into updated_subscription;

  if updated_subscription.id is null then
    raise exception 'Only free trials can be cancelled here. Paid plans are managed in Google Play.' using errcode = 'P0001';
  end if;

  return updated_subscription;
end;
$$;

revoke all on function public.set_free_trial_cancellation(boolean) from public, anon;
grant execute on function public.set_free_trial_cancellation(boolean) to authenticated;
