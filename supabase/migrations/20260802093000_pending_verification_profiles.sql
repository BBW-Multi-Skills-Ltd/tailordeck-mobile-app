-- Keep Supabase Auth pending users, but prevent TailorDeck app accounts from becoming active
-- until Supabase has confirmed the email address.

alter table public.profiles
  drop constraint if exists profiles_account_status_check;

alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status = any (array['pending_verification'::text, 'active'::text, 'deactivated'::text, 'deleted'::text]));

create or replace function public.guard_profile_account_status()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  confirmed_at timestamp with time zone;
begin
  if new.account_status = 'active' then
    select email_confirmed_at
    into confirmed_at
    from auth.users
    where id = new.user_id
    limit 1;

    if confirmed_at is null then
      raise exception 'Email must be verified before account activation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_account_status on public.profiles;
create trigger guard_profile_account_status
before insert or update of account_status on public.profiles
for each row
execute function public.guard_profile_account_status();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, full_name, email, account_status)
  select
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    case
      when new.email_confirmed_at is null then 'pending_verification'
      else 'active'
    end
  where not exists (
    select 1 from public.profiles where user_id = new.id
  );

  insert into public.business_profiles (user_id)
  select new.id
  where not exists (
    select 1 from public.business_profiles where user_id = new.id
  );

  insert into public.user_preferences (user_id)
  select new.id
  where not exists (
    select 1 from public.user_preferences where user_id = new.id
  );

  insert into public.brand_settings (user_id)
  select new.id
  where not exists (
    select 1 from public.brand_settings where user_id = new.id
  );

  insert into public.subscriptions (
    user_id,
    plan_name,
    status,
    billing_cycle,
    trial_ends_at,
    current_period_ends_at,
    cancel_at_period_end
  )
  select
    new.id,
    'free',
    'active',
    'monthly',
    case when new.email_confirmed_at is null then null else now() + interval '14 days' end,
    case when new.email_confirmed_at is null then null else now() + interval '14 days' end,
    false
  where not exists (
    select 1 from public.subscriptions where user_id = new.id
  );

  return new;
end;
$$;

update public.profiles p
set account_status = 'pending_verification', updated_at = now()
from auth.users u
where p.user_id = u.id
  and u.email_confirmed_at is null
  and p.account_status = 'active';

update public.subscriptions s
set
  trial_ends_at = null,
  current_period_ends_at = null,
  updated_at = now()
from auth.users u
where s.user_id = u.id
  and u.email_confirmed_at is null
  and s.plan_name = 'free';

create or replace function public.start_free_trial_subscription()
returns public.subscriptions
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  existing_subscription public.subscriptions;
  now_value timestamp with time zone := now();
  confirmed_at timestamp with time zone;
  current_account_status text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select email_confirmed_at
  into confirmed_at
  from auth.users
  where id = current_user_id
  limit 1;

  select account_status
  into current_account_status
  from public.profiles
  where user_id = current_user_id
  limit 1;

  if confirmed_at is null or current_account_status <> 'active' then
    raise exception 'Email must be verified before starting a plan';
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

revoke all on function public.start_free_trial_subscription() from public;
grant execute on function public.start_free_trial_subscription() to authenticated;
