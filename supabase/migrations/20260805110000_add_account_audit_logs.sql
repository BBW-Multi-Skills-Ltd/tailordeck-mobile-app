create table if not exists public.account_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint account_audit_logs_event_type_check check (
    event_type in (
      'account_deactivated',
      'account_deletion_requested',
      'account_restored'
    )
  )
);

alter table public.account_audit_logs enable row level security;

revoke all on table public.account_audit_logs from anon;
revoke insert, update, delete, truncate, references, trigger on table public.account_audit_logs from authenticated;
grant select on table public.account_audit_logs to authenticated;

drop policy if exists "Users can view own account audit logs" on public.account_audit_logs;
create policy "Users can view own account audit logs"
on public.account_audit_logs
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists idx_account_audit_logs_user_created
on public.account_audit_logs (user_id, created_at desc);

create or replace function public.deactivate_account(reason_value text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
  clean_reason text := nullif(btrim(coalesce(reason_value, '')), '');
begin
  update public.profiles
  set
    account_status = 'deactivated',
    deactivation_reason = clean_reason,
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

  insert into public.account_audit_logs (user_id, event_type, reason, metadata)
  values (
    updated_profile.user_id,
    'account_deactivated',
    clean_reason,
    jsonb_build_object(
      'profile_id', updated_profile.id,
      'account_status', updated_profile.account_status,
      'deactivated_at', updated_profile.deactivated_at
    )
  );

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
  clean_reason text := nullif(btrim(coalesce(reason_value, '')), '');
begin
  update public.profiles
  set
    account_status = 'pending_deletion',
    deactivation_reason = clean_reason,
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

  insert into public.account_audit_logs (user_id, event_type, reason, metadata)
  values (
    updated_profile.user_id,
    'account_deletion_requested',
    clean_reason,
    jsonb_build_object(
      'profile_id', updated_profile.id,
      'account_status', updated_profile.account_status,
      'deletion_requested_at', updated_profile.deletion_requested_at,
      'deletion_scheduled_at', updated_profile.deletion_scheduled_at
    )
  );

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
  previous_status text;
begin
  select account_status
  into previous_status
  from public.profiles
  where (user_id = auth.uid() or id = auth.uid())
  limit 1;

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

  insert into public.account_audit_logs (user_id, event_type, metadata)
  values (
    updated_profile.user_id,
    'account_restored',
    jsonb_build_object(
      'profile_id', updated_profile.id,
      'previous_status', previous_status,
      'account_status', updated_profile.account_status,
      'reactivated_at', updated_profile.reactivated_at
    )
  );

  return updated_profile;
end;
$$;
