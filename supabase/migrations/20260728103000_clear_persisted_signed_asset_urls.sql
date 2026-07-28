update public.profiles
set avatar_url = null
where avatar_storage_path is not null;

update public.brand_settings
set logo_url = null
where logo_storage_path is not null;

update public.brand_settings
set signature_url = null
where signature_storage_path is not null;
