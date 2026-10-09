-- Admins must pass two-step login (TOTP) before the database treats them as admins (docs/05 SEC-05, docs/11 S-1).
--
-- Supabase marks a session 'aal2' (authenticator assurance level 2) only after a TOTP code was verified.
-- is_admin() is what every admin policy and admin function checks (support tickets and replies, ticket
-- contacts, support attachments, website settings and reviews), so requiring aal2 here protects all of them.
-- get_my_admin_roles() stays as it is: the admin portal uses it right after the password step to know it
-- must ask for the code; it only reveals the user's own roles.

create or replace function public.is_admin(required_role text)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
        and required_role = any (roles)
    );
$function$;
