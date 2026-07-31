alter table public.profiles
  add constraint profiles_email_format_check
  check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$') not valid,
  add constraint profiles_phone_normalized_ng_check
  check (phone_normalized is null or phone_normalized ~ '^234[789][0-9]{9}$') not valid;

alter table public.business_profiles
  add constraint business_profiles_shop_name_not_blank_check
  check (shop_name is null or btrim(shop_name) <> '') not valid,
  add constraint business_profiles_shop_address_not_blank_check
  check (shop_address is null or btrim(shop_address) <> '') not valid,
  add constraint business_profiles_phone_normalized_ng_check
  check (business_phone_normalized is null or business_phone_normalized ~ '^234[789][0-9]{9}$') not valid,
  add constraint business_profiles_email_format_check
  check (business_email is null or business_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$') not valid,
  add constraint business_profiles_website_format_check
  check (
    website is null
    or website = ''
    or website ~* '^(https?://)?(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}([/?#].*)?$'
  ) not valid,
  add constraint business_profiles_cac_numeric_check
  check (cac_registration_number is null or cac_registration_number = '' or cac_registration_number ~ '^[0-9]{3,20}$') not valid;

alter table public.business_social_handles
  add constraint business_social_handles_handle_not_blank_check
  check (btrim(handle) <> '') not valid,
  add constraint business_social_handles_handle_format_check
  check (handle !~ '\s' and handle !~ '^@') not valid;

alter table public.clients
  add constraint clients_name_not_blank_check
  check (btrim(name) <> '') not valid,
  add constraint clients_phone_normalized_ng_check
  check (phone_normalized is null or phone_normalized ~ '^234[789][0-9]{9}$') not valid,
  add constraint clients_version_positive_check
  check (version > 0) not valid;

alter table public.jobs
  add constraint jobs_client_name_not_blank_check
  check (btrim(client_name) <> '') not valid,
  add constraint jobs_client_phone_normalized_ng_check
  check (client_phone_normalized is null or client_phone_normalized ~ '^234[789][0-9]{9}$') not valid,
  add constraint jobs_title_not_blank_check
  check (title is null or btrim(title) <> '') not valid,
  add constraint jobs_item_type_not_blank_check
  check (item_type is null or btrim(item_type) <> '') not valid,
  add constraint jobs_money_non_negative_check
  check (
    charge_amount_kobo >= 0
    and deposit_amount_kobo >= 0
    and total_expenses_kobo >= 0
  ) not valid,
  add constraint jobs_deposit_percent_range_check
  check (deposit_percent >= 0 and deposit_percent <= 100) not valid,
  add constraint jobs_deposit_not_above_charge_check
  check (deposit_amount_kobo <= charge_amount_kobo) not valid,
  add constraint jobs_material_yards_positive_check
  check (material_yards is null or material_yards > 0) not valid,
  add constraint jobs_version_positive_check
  check (version > 0) not valid,
  add constraint jobs_finalized_required_fields_check
  check (
    status = 'draft'
    or (
      client_phone_normalized is not null
      and title is not null
      and item_type is not null
      and charge_amount_kobo > 0
      and deadline_date is not null
      and deadline_time is not null
    )
  ) not valid;

alter table public.job_persons
  add constraint job_persons_name_not_blank_check
  check (btrim(person_name) <> '' and (name is null or btrim(name) <> '')) not valid,
  add constraint job_persons_quantity_positive_check
  check (quantity > 0) not valid,
  add constraint job_persons_sort_order_positive_check
  check (sort_order > 0) not valid,
  add constraint job_persons_measurements_object_check
  check (jsonb_typeof(measurements) = 'object') not valid;

alter table public.job_expenses
  add constraint job_expenses_name_not_blank_check
  check (btrim(name) <> '') not valid,
  add constraint job_expenses_cost_non_negative_check
  check (cost_amount_kobo >= 0) not valid;

alter table public.job_reference_photos
  add constraint job_reference_photos_storage_user_path_check
  check (storage_path ~ ('^' || user_id::text || '/')) not valid,
  add constraint job_reference_photos_image_mime_check
  check (mime_type is null or mime_type like 'image/%') not valid,
  add constraint job_reference_photos_size_check
  check (size_bytes is null or (size_bytes > 0 and size_bytes <= 10485760)) not valid,
  add constraint job_reference_photos_sort_order_positive_check
  check (sort_order > 0) not valid;

alter table public.documents
  add constraint documents_document_number_not_blank_check
  check (btrim(document_number) <> '') not valid,
  add constraint documents_storage_user_path_check
  check (storage_path is null or storage_path ~ ('^' || user_id::text || '/')) not valid,
  add constraint documents_pdf_mime_check
  check (mime_type is null or mime_type = 'application/pdf') not valid,
  add constraint documents_size_check
  check (size_bytes is null or (size_bytes > 0 and size_bytes <= 10485760)) not valid;

alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active', 'expired', 'past_due', 'cancelled')) not valid,
  add constraint subscriptions_period_order_check
  check (current_period_ends_at is null or current_period_ends_at > created_at) not valid;
