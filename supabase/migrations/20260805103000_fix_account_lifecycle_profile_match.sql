create or replace function public.deactivate_account(reason_value text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  update public.profiles
  set
    account_status = 'deactivated',
    deactivation_reason = nullif(btrim(coalesce(reason_value, '')), ''),
    deactivated_at = now(),
    deleted_at = null,
    deletion_requested_at = null,
    deletion_scheduled_at = null,
    updated_at = now()
  where (user_id = auth.uid() or id = auth.uid())
    and coalesce(account_status, 'active') <> 'deleted'
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'We could not find your account profile. Please refresh and try again.'
      using errcode = 'P0001';
  end if;

  return updated_profile;
end;
$$;

create or replace function public.request_account_deletion(reason_value text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  update public.profiles
  set
    account_status = 'pending_deletion',
    deactivation_reason = nullif(btrim(coalesce(reason_value, '')), ''),
    deactivated_at = now(),
    deleted_at = now(),
    deletion_requested_at = now(),
    deletion_scheduled_at = now() + interval '14 days',
    updated_at = now()
  where (user_id = auth.uid() or id = auth.uid())
    and coalesce(account_status, 'active') <> 'deleted'
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'We could not find your account profile. Please refresh and try again.'
      using errcode = 'P0001';
  end if;

  return updated_profile;
end;
$$;

create or replace function public.restore_account()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  update public.profiles
  set
    account_status = 'active',
    deactivation_reason = null,
    deactivated_at = null,
    deleted_at = null,
    deletion_requested_at = null,
    deletion_scheduled_at = null,
    reactivated_at = now(),
    updated_at = now()
  where (user_id = auth.uid() or id = auth.uid())
    and account_status in ('deactivated', 'pending_deletion')
    and (
      account_status = 'deactivated'
      or deletion_scheduled_at is null
      or deletion_scheduled_at > now()
    )
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'This account can no longer be restored.'
      using errcode = 'P0001';
  end if;

  return updated_profile;
end;
$$;
