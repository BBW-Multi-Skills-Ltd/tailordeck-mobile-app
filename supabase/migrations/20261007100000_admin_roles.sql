-- Admin access for the website admin area (/admin).
-- Who is an admin, and what they may manage, is stored here and enforced by row level security:
--   'website' = manage marketing website content (links, reviews, demo video)
--   'support' = read and answer support tickets
-- The admin UI only shows what these roles allow; the database refuses everything else.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  roles text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_roles_check check (roles <@ array['website', 'support']::text[])
);

alter table public.admin_users enable row level security;

-- Admins can see their own admin row; nobody can change admin rows from the app (service role only).
drop policy if exists "Admins can read own admin row" on public.admin_users;
create policy "Admins can read own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

revoke insert, update, delete on public.admin_users from anon, authenticated;

/** True when the signed-in user holds the given admin role. Used by RLS policies on admin-managed tables. */
create or replace function public.is_admin(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
      and required_role = any (roles)
  );
$$;

/** The signed-in user's admin roles (empty for normal users). */
create or replace function public.get_my_admin_roles()
returns text[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select roles from public.admin_users where user_id = auth.uid()), '{}'::text[]);
$$;

revoke all on function public.is_admin(text) from public, anon;
revoke all on function public.get_my_admin_roles() from public, anon;
grant execute on function public.is_admin(text) to authenticated;
grant execute on function public.get_my_admin_roles() to authenticated;
