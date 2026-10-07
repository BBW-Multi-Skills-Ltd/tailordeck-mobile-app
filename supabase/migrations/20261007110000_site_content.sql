-- Marketing website content managed from /admin (role 'website').
-- Public visitors can read it (the website shows it); only website admins can change it.

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  company_site text not null default 'https://bbwtechinnovations.com',
  instagram_url text not null default '',
  facebook_url text not null default '',
  x_url text not null default '',
  tiktok_url text not null default '',
  whatsapp_number text not null default '',
  play_store_url text not null default 'https://play.google.com/store/apps/details?id=app.tailordeck',
  app_store_url text not null default '',
  -- QR codes are generated in the admin when a store link is saved, so the public site needs no QR library.
  play_store_qr_svg text not null default '',
  app_store_qr_svg text not null default '',
  demo_video_url text not null default '',
  demo_video_poster_url text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint site_settings_whatsapp_digits check (whatsapp_number = '' or whatsapp_number ~ '^[0-9]{8,15}$'),
  constraint site_settings_urls_https check (
    (company_site = '' or company_site ~* '^https://')
    and (instagram_url = '' or instagram_url ~* '^https://')
    and (facebook_url = '' or facebook_url ~* '^https://')
    and (x_url = '' or x_url ~* '^https://')
    and (tiktok_url = '' or tiktok_url ~* '^https://')
    and (play_store_url = '' or play_store_url ~* '^https://')
    and (app_store_url = '' or app_store_url ~* '^https://')
    and (demo_video_url = '' or demo_video_url ~* '^https://')
    and (demo_video_poster_url = '' or demo_video_poster_url ~* '^https://')
  ),
  constraint site_settings_qr_is_svg check (
    (play_store_qr_svg = '' or play_store_qr_svg like '<svg%')
    and (app_store_qr_svg = '' or app_store_qr_svg like '<svg%')
  )
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.site_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '' and length(name) <= 80),
  shop text not null default '' check (length(shop) <= 80),
  city text not null default '' check (length(city) <= 60),
  quote text not null check (btrim(quote) <> '' and length(quote) <= 600),
  rating smallint not null default 5 check (rating between 1 and 5),
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_reviews_published_order_idx on public.site_reviews (published, sort_order, created_at);

alter table public.site_settings enable row level security;
alter table public.site_reviews enable row level security;

-- Settings: everyone reads; website admins update (the single row always exists, so no insert/delete).
drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Website admins update site settings" on public.site_settings;
create policy "Website admins update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin('website'))
  with check (public.is_admin('website'));

-- Reviews: the public sees published ones; website admins see and manage all.
drop policy if exists "Anyone can read published reviews" on public.site_reviews;
create policy "Anyone can read published reviews"
  on public.site_reviews for select
  to anon, authenticated
  using (published or public.is_admin('website'));

drop policy if exists "Website admins insert reviews" on public.site_reviews;
create policy "Website admins insert reviews"
  on public.site_reviews for insert
  to authenticated
  with check (public.is_admin('website'));

drop policy if exists "Website admins update reviews" on public.site_reviews;
create policy "Website admins update reviews"
  on public.site_reviews for update
  to authenticated
  using (public.is_admin('website'))
  with check (public.is_admin('website'));

drop policy if exists "Website admins delete reviews" on public.site_reviews;
create policy "Website admins delete reviews"
  on public.site_reviews for delete
  to authenticated
  using (public.is_admin('website'));

grant select on public.site_settings, public.site_reviews to anon, authenticated;
grant update on public.site_settings to authenticated;
grant insert, update, delete on public.site_reviews to authenticated;

-- Keep updated_at / updated_by accurate.
create or replace function public.touch_site_content()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  if tg_table_name = 'site_settings' then
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists touch_site_settings on public.site_settings;
create trigger touch_site_settings before update on public.site_settings
  for each row execute function public.touch_site_content();

drop trigger if exists touch_site_reviews on public.site_reviews;
create trigger touch_site_reviews before update on public.site_reviews
  for each row execute function public.touch_site_content();
