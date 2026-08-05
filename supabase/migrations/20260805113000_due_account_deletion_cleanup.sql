alter table public.account_audit_logs
  drop constraint if exists account_audit_logs_user_id_fkey;

alter table public.account_audit_logs
  drop constraint if exists account_audit_logs_event_type_check;

alter table public.account_audit_logs
  add constraint account_audit_logs_event_type_check check (
    event_type in (
      'account_deactivated',
      'account_deletion_requested',
      'account_restored',
      'account_deleted'
    )
  );

create index if not exists idx_profiles_due_account_deletions
on public.profiles (deletion_scheduled_at, user_id)
where account_status = 'pending_deletion';

create or replace function public.list_due_account_deletions(batch_size integer default 25)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  request_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
  safe_batch_size integer := greatest(1, least(coalesce(batch_size, 25), 100));
  result jsonb;
begin
  if request_role <> 'service_role' then
    raise exception 'Service role required to list due account deletions.'
      using errcode = '42501';
  end if;

  with due_profiles as (
    select *
    from public.profiles
    where account_status = 'pending_deletion'
      and deletion_scheduled_at is not null
      and deletion_scheduled_at <= now()
    order by deletion_scheduled_at asc
    limit safe_batch_size
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'userId', p.user_id,
        'profileId', p.id,
        'email', p.email,
        'fullName', p.full_name,
        'deletionScheduledAt', p.deletion_scheduled_at,
        'counts', jsonb_build_object(
          'clients', (select count(*) from public.clients c where c.user_id = p.user_id),
          'jobs', (select count(*) from public.jobs j where j.user_id = p.user_id),
          'jobPersons', (select count(*) from public.job_persons jp where jp.user_id = p.user_id),
          'jobExpenses', (select count(*) from public.job_expenses je where je.user_id = p.user_id),
          'jobReferencePhotos', (select count(*) from public.job_reference_photos jrp where jrp.user_id = p.user_id),
          'documents', (select count(*) from public.documents d where d.user_id = p.user_id),
          'notifications', (select count(*) from public.notifications n where n.user_id = p.user_id)
        ),
        'storage', (
          select coalesce(jsonb_agg(storage_item), '[]'::jsonb)
          from (
            select jsonb_build_object('bucket', 'avatars', 'path', p.avatar_storage_path) as storage_item
            where p.avatar_storage_path is not null
            union all
            select jsonb_build_object('bucket', 'brand-assets', 'path', bs.logo_storage_path)
            from public.brand_settings bs
            where bs.user_id = p.user_id
              and bs.logo_storage_path is not null
            union all
            select jsonb_build_object('bucket', 'brand-assets', 'path', bs.signature_storage_path)
            from public.brand_settings bs
            where bs.user_id = p.user_id
              and bs.signature_storage_path is not null
            union all
            select jsonb_build_object('bucket', 'job-photos', 'path', jrp.storage_path)
            from public.job_reference_photos jrp
            where jrp.user_id = p.user_id
              and jrp.storage_path is not null
            union all
            select jsonb_build_object('bucket', 'documents', 'path', d.storage_path)
            from public.documents d
            where d.user_id = p.user_id
              and d.storage_path is not null
          ) storage_items
        )
      )
    ),
    '[]'::jsonb
  )
  into result
  from due_profiles p;

  return result;
end;
$$;

grant execute on function public.list_due_account_deletions(integer) to service_role;
revoke execute on function public.list_due_account_deletions(integer) from anon, authenticated;
