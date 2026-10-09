-- Admin rights need two-step login (aal2), docs/11 S-1. Rolled back. npm run test:db:staging
\set ON_ERROR_STOP on
begin;

select set_config('test.uid', (select id::text from auth.users where email = 'qa@staging.local'), true);
insert into public.admin_users (user_id, roles) values (current_setting('test.uid')::uuid, array['website', 'support'])
  on conflict (user_id) do update set roles = excluded.roles;

-- A support ticket from another user, to see whether the admin can read it.
insert into auth.users (id, email, aud, role) values ('00000000-0000-4000-8000-00000000b0b0', 'other-user@staging.local', 'authenticated', 'authenticated');
insert into public.support_tickets (id, user_id, category, priority, subject, message)
  values ('00000000-0000-4000-8000-00000000d0d0', '00000000-0000-4000-8000-00000000b0b0', 'general', 'normal', 'Two-step test', 'Message for the two-step test');

-- 1. Password only (aal1): not an admin.
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.uid'), 'role', 'authenticated', 'aal', 'aal1')::text, true);
set local role authenticated;
do $$ begin
  if public.is_admin('support') or public.is_admin('website') then raise exception 'FAIL: admin rights without two-step login'; end if;
  if exists (select 1 from public.support_tickets where id = '00000000-0000-4000-8000-00000000d0d0') then
    raise exception 'FAIL: read another user''s ticket without two-step login';
  end if;
  update public.site_settings set company_site = 'https://no-two-step.example.com' where id = 1;
  if exists (select 1 from public.site_settings where company_site = 'https://no-two-step.example.com') then
    raise exception 'FAIL: changed website without two-step login';
  end if;
  raise notice 'ok: password-only admin session has no admin rights';
end $$;
reset role;

-- 2. After the code (aal2): admin rights work.
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.uid'), 'role', 'authenticated', 'aal', 'aal2')::text, true);
set local role authenticated;
do $$ begin
  if not (public.is_admin('support') and public.is_admin('website')) then raise exception 'FAIL: two-step admin lost rights'; end if;
  if not exists (select 1 from public.support_tickets where id = '00000000-0000-4000-8000-00000000d0d0') then
    raise exception 'FAIL: two-step support admin cannot read tickets';
  end if;
  raise notice 'ok: two-step admin session has admin rights';
end $$;
reset role;

-- 3. A non-admin with two-step login is still not an admin.
delete from public.admin_users where user_id = current_setting('test.uid')::uuid;
set local role authenticated;
do $$ begin
  if public.is_admin('support') then raise exception 'FAIL: non-admin became admin'; end if;
  raise notice 'ok: two-step login alone does not make anyone an admin';
end $$;
reset role;

rollback;
\echo 'All admin two-step login tests passed.'
