drop policy if exists "Users can insert own subscription" on public.subscriptions;
drop policy if exists "Users can update own subscription" on public.subscriptions;

revoke insert, update, delete, truncate on table public.subscriptions from anon;
revoke insert, update, delete, truncate on table public.subscriptions from authenticated;

create or replace function public.start_free_trial_subscription()
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_subscription public.subscriptions;
  now_value timestamp with time zone := now();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into existing_subscription
  from public.subscriptions
  where user_id = current_user_id
  limit 1;

  if existing_subscription.id is not null then
    if existing_subscription.plan_name <> 'free' then
      return existing_subscription;
    end if;

    if existing_subscription.trial_ends_at is null then
      update public.subscriptions
      set
        status = 'active',
        trial_ends_at = now_value + interval '14 days',
        current_period_ends_at = now_value + interval '14 days',
        cancel_at_period_end = false,
        updated_at = now_value
      where user_id = current_user_id
      returning * into existing_subscription;
    end if;

    return existing_subscription;
  end if;

  insert into public.subscriptions (
    user_id,
    plan_name,
    status,
    billing_cycle,
    trial_ends_at,
    current_period_ends_at,
    cancel_at_period_end,
    updated_at
  )
  values (
    current_user_id,
    'free',
    'active',
    'monthly',
    now_value + interval '14 days',
    now_value + interval '14 days',
    false,
    now_value
  )
  returning * into existing_subscription;

  return existing_subscription;
end;
$$;

create or replace function public.set_subscription_cancel_at_period_end(cancel_at_period_end_value boolean)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  updated_subscription public.subscriptions;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.subscriptions
  set
    cancel_at_period_end = cancel_at_period_end_value,
    updated_at = now()
  where user_id = current_user_id
  returning * into updated_subscription;

  if updated_subscription.id is null then
    raise exception 'Subscription not found';
  end if;

  return updated_subscription;
end;
$$;

revoke all on function public.start_free_trial_subscription() from public;
revoke all on function public.set_subscription_cancel_at_period_end(boolean) from public;

grant execute on function public.start_free_trial_subscription() to authenticated;
grant execute on function public.set_subscription_cancel_at_period_end(boolean) to authenticated;
