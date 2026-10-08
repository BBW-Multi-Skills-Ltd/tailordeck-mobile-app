-- Permission tests for profiles and the website/admin tables (docs/05 SEC-01, SEC-03).
-- Run against local staging only: npm run test:db:staging. Everything runs in one transaction that is rolled back.
\set ON_ERROR_STOP on
begin;

-- Test user: the staging QA account, made an active non-admin for most checks.
select set_config('test.uid', (select id::text from auth.users where email = 'qa@staging.local'), true);
do $$ begin
  if current_setting('test.uid', true) is null or current_setting('test.uid', true) = '' then
    raise exception 'Run npm run staging:start first (QA user missing)';
  end if;
end $$;
update public.profiles set account_status = 'active' where user_id = current_setting('test.uid')::uuid;
delete from public.admin_users where user_id = current_setting('test.uid')::uuid;

create function pg_temp.act_as(role_name text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.uid'), 'role', role_name)::text, true);
  execute format('set local role %I', role_name);
end $$;

create function pg_temp.expect_denied(statement text, label text) returns void language plpgsql as $$
begin
  execute statement;
  raise exception 'FAIL: % was allowed', label;
exception when insufficient_privilege then
  raise notice 'ok: % denied', label;
end $$;

-- 1. A user edits the allowed profile fields.
select pg_temp.act_as('authenticated');
update public.profiles set full_name = 'Grant Test', phone = '08031234567', phone_normalized = '2348031234567',
  onboarding_complete = true, updated_at = now()
  where user_id = current_setting('test.uid')::uuid;
do $$ begin
  if (select full_name from public.profiles where user_id = current_setting('test.uid')::uuid) <> 'Grant Test' then
    raise exception 'FAIL: allowed profile update did not apply';
  end if;
  raise notice 'ok: allowed profile fields update';
end $$;

-- 2. A user cannot change lifecycle or identity columns.
select pg_temp.expect_denied(format('update public.profiles set account_status = %L where user_id = %L', 'active', current_setting('test.uid')), 'profiles.account_status');
select pg_temp.expect_denied(format('update public.profiles set deleted_at = null where user_id = %L', current_setting('test.uid')), 'profiles.deleted_at');
select pg_temp.expect_denied(format('update public.profiles set deletion_scheduled_at = null where user_id = %L', current_setting('test.uid')), 'profiles.deletion_scheduled_at');
select pg_temp.expect_denied(format('update public.profiles set user_id = gen_random_uuid() where user_id = %L', current_setting('test.uid')), 'profiles.user_id');

-- 3. Delete and restore still work through the functions.
select public.request_account_deletion('grant test');
do $$ begin
  if (select account_status from public.profiles where user_id = current_setting('test.uid')::uuid) <> 'pending_deletion' then
    raise exception 'FAIL: request_account_deletion did not set pending_deletion';
  end if;
  raise notice 'ok: request_account_deletion';
end $$;
select public.restore_account();
do $$ begin
  if (select account_status from public.profiles where user_id = current_setting('test.uid')::uuid) <> 'active' then
    raise exception 'FAIL: restore_account did not restore';
  end if;
  raise notice 'ok: restore_account';
end $$;

-- 4. A signed-in non-admin cannot change website content (policies) or truncate.
update public.site_settings set company_site = 'https://hacked.example.com' where id = 1;
do $$ begin
  if exists (select 1 from public.site_settings where company_site = 'https://hacked.example.com') then raise exception 'FAIL: non-admin updated site_settings'; end if;
  raise notice 'ok: non-admin cannot update site_settings';
end $$;
select pg_temp.expect_denied('truncate public.site_reviews', 'authenticated truncate site_reviews');
select pg_temp.expect_denied('delete from public.admin_users', 'authenticated delete admin_users');
reset role;

-- 5. Anonymous visitors can only read.
select pg_temp.act_as('anon');
select pg_temp.expect_denied('update public.site_settings set company_site = $t$https://x.example.com$t$', 'anon update site_settings');
select pg_temp.expect_denied($s$insert into public.site_reviews (name, quote, rating) values ('x', 'x', 5)$s$, 'anon insert site_reviews');
select pg_temp.expect_denied('select * from public.admin_users', 'anon read admin_users');
select pg_temp.expect_denied('select * from public.profiles', 'anon read profiles');
select count(*) >= 0 as anon_reads_site_settings from public.site_settings;
reset role;

-- 6. A website admin can still edit content.
insert into public.admin_users (user_id, roles) values (current_setting('test.uid')::uuid, array['website']);
select pg_temp.act_as('authenticated');
update public.site_settings set company_site = 'https://admin-edit.example.com' where id = 1;
insert into public.site_reviews (name, quote, rating) values ('Grant Test', 'Works', 5);
do $$ begin
  if not exists (select 1 from public.site_settings where company_site = 'https://admin-edit.example.com') then raise exception 'FAIL: admin could not update site_settings'; end if;
  if not exists (select 1 from public.site_reviews where name = 'Grant Test') then raise exception 'FAIL: admin could not insert review'; end if;
  raise notice 'ok: website admin edits content';
end $$;
reset role;

rollback;
\echo 'All profile and site permission tests passed.'
