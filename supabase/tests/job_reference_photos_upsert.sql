-- Reference photo rows are saved the way the app saves them (src/services/photoService.ts):
-- INSERT ... ON CONFLICT (job_id, storage_path) DO UPDATE. Rolled back. npm run test:db:staging
\set ON_ERROR_STOP on
begin;

select set_config('test.uid', (select id::text from auth.users where email = 'qa@staging.local'), true);
insert into public.clients (id, user_id, name) values ('00000000-0000-4000-8000-0000000000c1', current_setting('test.uid')::uuid, 'Photo Test Client');
insert into public.jobs (id, user_id, client_id, client_name, status)
  values ('00000000-0000-4000-8000-0000000000a1', current_setting('test.uid')::uuid, '00000000-0000-4000-8000-0000000000c1', 'Photo Test Client', 'draft');

select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.uid'), 'role', 'authenticated')::text, true);
set local role authenticated;

-- First save of a new photo, then a retry of the same photo (must update, not duplicate).
insert into public.job_reference_photos (job_id, user_id, storage_path, file_name, sort_order)
  values ('00000000-0000-4000-8000-0000000000a1', current_setting('test.uid')::uuid,
          current_setting('test.uid') || '/00000000-0000-4000-8000-0000000000a1/job-photo-abc.jpg', 'a.jpg', 1)
  on conflict (job_id, storage_path) do update set file_name = excluded.file_name, sort_order = excluded.sort_order;
insert into public.job_reference_photos (job_id, user_id, storage_path, file_name, sort_order)
  values ('00000000-0000-4000-8000-0000000000a1', current_setting('test.uid')::uuid,
          current_setting('test.uid') || '/00000000-0000-4000-8000-0000000000a1/job-photo-abc.jpg', 'a-retry.jpg', 2)
  on conflict (job_id, storage_path) do update set file_name = excluded.file_name, sort_order = excluded.sort_order;

do $$ begin
  if (select count(*) from public.job_reference_photos where job_id = '00000000-0000-4000-8000-0000000000a1') <> 1 then
    raise exception 'FAIL: retry duplicated the photo row';
  end if;
  if (select file_name from public.job_reference_photos where job_id = '00000000-0000-4000-8000-0000000000a1') <> 'a-retry.jpg' then
    raise exception 'FAIL: retry did not update the photo row';
  end if;
  raise notice 'ok: photo row saved and retry updates it';
end $$;

-- Another user's job is still refused.
select set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
do $$ begin
  update public.job_reference_photos set file_name = 'hacked.jpg' where job_id = '00000000-0000-4000-8000-0000000000a1';
  if exists (select 1 from public.job_reference_photos where file_name = 'hacked.jpg') then
    raise exception 'FAIL: another user changed the photo row';
  end if;
  raise notice 'ok: other users cannot change the photo row';
end $$;
reset role;

rollback;
\echo 'All job reference photo tests passed.'
