create or replace function public.normalize_ng_phone(phone_value text)
returns text
language plpgsql
immutable
as $$
declare
  digits text := regexp_replace(coalesce(phone_value, ''), '\D', '', 'g');
begin
  if digits = '' then
    return null;
  end if;

  if digits like '0%' then
    return '234' || substring(digits from 2);
  end if;

  if digits like '234%' then
    return digits;
  end if;

  return '234' || digits;
end;
$$;

create or replace function public.activate_verified_profile(
  full_name_value text default null,
  email_value text default null,
  phone_value text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  confirmed_at timestamp with time zone;
  updated_profile public.profiles;
  normalized_phone text := public.normalize_ng_phone(phone_value);
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select email_confirmed_at
  into confirmed_at
  from auth.users
  where id = current_user_id
  limit 1;

  if confirmed_at is null then
    raise exception 'Email must be verified before account activation';
  end if;

  update public.profiles
  set
    account_status = 'active',
    full_name = coalesce(nullif(btrim(full_name_value), ''), full_name),
    email = coalesce(nullif(lower(btrim(email_value)), ''), email),
    phone = coalesce(nullif(btrim(phone_value), ''), phone),
    phone_normalized = coalesce(normalized_phone, phone_normalized),
    updated_at = now()
  where user_id = current_user_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.normalize_ng_phone(text) from public;
revoke all on function public.activate_verified_profile(text, text, text) from public;
grant execute on function public.activate_verified_profile(text, text, text) to authenticated;
