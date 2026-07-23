alter table public.business_profiles
  add column if not exists cac_registration_number text;

alter table public.brand_settings
  add column if not exists show_cac boolean not null default false;
