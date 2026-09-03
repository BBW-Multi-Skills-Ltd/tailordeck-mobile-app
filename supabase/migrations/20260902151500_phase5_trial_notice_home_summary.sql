set check_function_bodies = off;

create or replace function public.notify_trial_expired_once(target_user_id uuid, trial_end timestamp with time zone)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if target_user_id is null or trial_end is null then
    return;
  end if;

  insert into public.notifications (user_id, type, title, message, action_url, created_at)
  select
    target_user_id,
    'account',
    'Your free trial has ended',
    'You can continue on Free with 3 jobs included, or upgrade to Starter for unlimited job management.',
    '/settings/subscription',
    now()
  where not exists (
    select 1
    from public.notifications n
    where n.user_id = target_user_id
      and n.type = 'account'
      and n.title = 'Your free trial has ended'
      and n.action_url = '/settings/subscription'
      and n.deleted_at is null
  );
end;
$$;

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

create or replace function public.get_home_current_month_summary()
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
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  return query
  select
    to_char(date_trunc('month', now()), 'YYYY-MM') as month,
    count(j.id)::integer as jobs,
    coalesce(sum(j.charge_amount_kobo), 0)::bigint as revenue_kobo,
    coalesce(sum(j.total_expenses_kobo), 0)::bigint as expenses_kobo,
    coalesce(sum(coalesce(j.profit_kobo, j.charge_amount_kobo - j.total_expenses_kobo)), 0)::bigint as profit_kobo
  from public.jobs j
  where j.user_id = auth.uid()
    and j.deleted_at is null
    and j.status <> 'draft'
    and j.created_at >= date_trunc('month', now())
    and j.created_at < date_trunc('month', now()) + interval '1 month';
end;
$$;

revoke all privileges on function public.notify_trial_expired_once(uuid, timestamp with time zone) from public, anon, authenticated;
revoke all privileges on function public.refresh_current_subscription_lifecycle() from public, anon, authenticated;
revoke all privileges on function public.get_home_current_month_summary() from public, anon, authenticated;

grant execute on function public.refresh_current_subscription_lifecycle() to authenticated;
grant execute on function public.get_home_current_month_summary() to authenticated;
