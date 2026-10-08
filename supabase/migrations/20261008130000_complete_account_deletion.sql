-- Complete account deletion (docs/05 SEC-02, docs/11 P-4).
--
-- 1. The four user file buckets were created by hand in production and were missing from the migrations,
--    so a fresh database (local staging) had no avatars/brand-assets/job-photos/documents buckets.
--    Same settings as production; does nothing where they already exist.
-- 2. list_due_account_deletions now lists EVERY stored file of the user, read from storage.objects:
--    everything under "<user id>/" in the user buckets (including replaced avatars, logos and signatures
--    that no row points to any more) and everything under "<ticket id>/" in support-attachments for the
--    user's tickets. Before, only files still referenced by a row were deleted.
-- 3. Old edge_rate_limits rows (which hold user ids) are purged daily.

-- 1. Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('brand-assets', 'brand-assets', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('job-photos', 'job-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- 2. Due deletions with every stored file
create or replace function public.list_due_account_deletions(batch_size integer default 25)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  safe_batch_size integer := greatest(1, least(coalesce(batch_size, 25), 100));
  result jsonb;
begin
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
          'notifications', (select count(*) from public.notifications n where n.user_id = p.user_id),
          'supportTickets', (select count(*) from public.support_tickets t where t.user_id = p.user_id)
        ),
        'storage', (
          select coalesce(jsonb_agg(jsonb_build_object('bucket', o.bucket_id, 'path', o.name)), '[]'::jsonb)
          from storage.objects o
          where (
              o.bucket_id in ('avatars', 'brand-assets', 'job-photos', 'documents')
              and (storage.foldername(o.name))[1] = p.user_id::text
            )
            or (
              o.bucket_id = 'support-attachments'
              and (storage.foldername(o.name))[1] in (
                select t.id::text from public.support_tickets t where t.user_id = p.user_id
              )
            )
        )
      )
    ),
    '[]'::jsonb
  )
  into result
  from due_profiles p;

  return result;
end;
$function$;

-- 3. Daily purge of rate-limit rows
select cron.unschedule('purge-edge-rate-limits') where exists (select 1 from cron.job where jobname = 'purge-edge-rate-limits');
select cron.schedule(
  'purge-edge-rate-limits',
  '30 3 * * *',
  $$delete from public.edge_rate_limits where updated_at < now() - interval '2 days'$$
);
