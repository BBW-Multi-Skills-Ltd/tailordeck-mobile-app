update public.plans
set
  display_name = 'Free',
  trial_days = 14,
  is_active = true
where name = 'free';

insert into public.plan_features (plan_name, feature_key, is_enabled)
values
  ('free', 'pdf_export', false),
  ('free', 'document_sending', false),
  ('free', 'dashboard_analytics', false),
  ('free', 'full_document_setup', false),
  ('starter', 'pdf_export', false),
  ('starter', 'document_sending', false),
  ('starter', 'dashboard_analytics', false),
  ('starter', 'full_document_setup', false),
  ('pro', 'pdf_export', true),
  ('pro', 'document_sending', true),
  ('pro', 'dashboard_analytics', true),
  ('pro', 'full_document_setup', true)
on conflict (plan_name, feature_key) do update set
  is_enabled = excluded.is_enabled;

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
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions%rowtype;
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
  is_paid_active boolean := false;
begin
  if current_user_id is null then
    return;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = current_user_id
  limit 1;

  if not found then
    return;
  end if;

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
  is_trial_active :=
    current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end > now();

  is_paid_active :=
    current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status = 'active'
    and (
      current_subscription.current_period_ends_at is null
      or current_subscription.current_period_ends_at > now()
    );

  return query
  select
    current_subscription.id,
    current_subscription.plan_name::text,
    current_subscription.status::text,
    case
      when is_trial_active then 'trial'
      when current_subscription.plan_name = 'free' and current_subscription.status = 'active' then 'free'
      when is_paid_active then current_subscription.plan_name::text
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
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions%rowtype;
  normalized_feature_key text := lower(btrim(coalesce(feature_key_value, '')));
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
begin
  if current_user_id is null or normalized_feature_key = '' then
    return false;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = current_user_id
  limit 1;

  if not found then
    return false;
  end if;

  if current_subscription.status <> 'active' then
    return false;
  end if;

  if current_subscription.plan_name = 'free' then
    trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
    is_trial_active := trial_end is not null and trial_end > now();

    if is_trial_active then
      return exists (
        select 1
        from public.plan_features
        where lower(plan_name) = 'pro'
          and lower(feature_key) = normalized_feature_key
          and is_enabled = true
      );
    end if;
  elsif current_subscription.current_period_ends_at is not null and current_subscription.current_period_ends_at <= now() then
    return false;
  end if;

  return exists (
    select 1
    from public.plan_features
    where lower(plan_name) = lower(current_subscription.plan_name)
      and lower(feature_key) = normalized_feature_key
      and is_enabled = true
  );
end;
$$;

revoke all privileges on function public.get_effective_subscription_state() from public, anon, authenticated;
revoke all privileges on function public.has_feature_access(text) from public, anon, authenticated;

grant execute on function public.get_effective_subscription_state() to authenticated;
grant execute on function public.has_feature_access(text) to authenticated;
