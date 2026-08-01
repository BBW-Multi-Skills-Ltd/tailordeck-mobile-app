insert into public.plans (name, display_name, monthly_price_kobo, yearly_price_kobo, trial_days, is_active)
values
  ('free', '14 Days Free Trial', 0, 0, 14, true),
  ('starter', 'Starter', 250000, 2400000, 0, true),
  ('pro', 'Pro', 450000, 4200000, 0, true)
on conflict (name) do update set
  display_name = excluded.display_name,
  monthly_price_kobo = excluded.monthly_price_kobo,
  yearly_price_kobo = excluded.yearly_price_kobo,
  trial_days = excluded.trial_days,
  is_active = excluded.is_active;

insert into public.plan_features (plan_name, feature_key, is_enabled)
values
  ('free', 'pdf_export', true),
  ('free', 'document_sending', true),
  ('free', 'dashboard_analytics', true),
  ('free', 'full_document_setup', true),
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

create or replace function public.has_feature_access(feature_key_value text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions;
  normalized_feature_key text := lower(btrim(coalesce(feature_key_value, '')));
  trial_end timestamp with time zone;
begin
  if current_user_id is null or normalized_feature_key = '' then
    return false;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = current_user_id
  limit 1;

  if current_subscription.id is null then
    return false;
  end if;

  if current_subscription.status <> 'active' then
    return false;
  end if;

  if current_subscription.plan_name = 'free' then
    trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
    if trial_end is null or trial_end <= now() then
      return false;
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

revoke all on function public.has_feature_access(text) from public;
grant execute on function public.has_feature_access(text) to authenticated;
