-- Least privilege for profiles and the website/admin tables (docs/05 SEC-01, SEC-03).
--
-- 1. profiles: signed-in users could UPDATE every column of their own row, including account_status,
--    deletion_scheduled_at and deleted_at (e.g. set themselves back to 'active' during a pending deletion).
--    Now they may only update the fields the app edits. Lifecycle columns change only through the
--    SECURITY DEFINER functions (activate_verified_profile, deactivate_account, request_account_deletion,
--    restore_account) and the service role, which are not affected by these grants.
-- 2. site_settings, site_reviews, admin_users: anon and authenticated held INSERT/UPDATE/DELETE/TRUNCATE
--    beyond what the row-level security policies allow. Grants now match the policies.

-- 1. profiles
revoke update on table public.profiles from authenticated;
revoke all on table public.profiles from anon;
grant update (full_name, email, phone, phone_normalized, avatar_url, avatar_storage_path, onboarding_complete, updated_at)
  on table public.profiles to authenticated;

-- 2. Website and admin tables
revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated; -- policy: website admins only

revoke all on table public.site_reviews from anon, authenticated;
grant select on table public.site_reviews to anon, authenticated;
grant insert, update, delete on table public.site_reviews to authenticated; -- policies: website admins only

revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated; -- policy: own row only
