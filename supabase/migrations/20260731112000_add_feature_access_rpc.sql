create or replace function public.has_feature_access(feature_key_value text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions;
  trial_end timestamp with time zone;
begin
  if current_user_id is null or btrim(coalesce(feature_key_value, '')) = '' then
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
    where plan_name = current_subscription.plan_name
      and feature_key = feature_key_value
      and is_enabled = true
  );
end;
$$;

revoke all on function public.has_feature_access(text) from public;
grant execute on function public.has_feature_access(text) to authenticated;
