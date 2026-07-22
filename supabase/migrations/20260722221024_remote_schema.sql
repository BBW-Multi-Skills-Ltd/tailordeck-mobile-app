drop extension if exists "pg_net";


  create table "public"."brand_settings" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "logo_url" text,
    "logo_storage_path" text,
    "signature_url" text,
    "signature_storage_path" text,
    "document_template" text not null default 'classic-wave'::text,
    "header_color" text not null default '#7B1E37'::text,
    "body_color" text not null default '#FAF8F5'::text,
    "accent_color" text not null default '#C9A84C'::text,
    "show_business_phone" boolean not null default true,
    "show_business_email" boolean not null default true,
    "show_website" boolean not null default false,
    "show_address" boolean not null default true,
    "show_social" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."brand_settings" enable row level security;


  create table "public"."business_profiles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "shop_name" text,
    "business_phone" text,
    "business_phone_normalized" text,
    "business_email" text,
    "website" text,
    "shop_address" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."business_profiles" enable row level security;


  create table "public"."business_social_handles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "platform" text not null,
    "handle" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."business_social_handles" enable row level security;


  create table "public"."clients" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "name" text not null,
    "phone" text,
    "phone_normalized" text,
    "sex" text,
    "measurement_unit" text not null default 'inches'::text,
    "last_job_date" date,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1
      );


alter table "public"."clients" enable row level security;


  create table "public"."documents" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "job_id" uuid not null,
    "type" text not null,
    "document_number" text not null,
    "storage_path" text,
    "file_name" text,
    "mime_type" text default 'application/pdf'::text,
    "size_bytes" integer,
    "sent_via_whatsapp" boolean not null default false,
    "shared_at" timestamp with time zone,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."documents" enable row level security;


  create table "public"."job_expenses" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "job_id" uuid not null,
    "user_id" uuid not null,
    "name" text not null,
    "cost_amount_kobo" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."job_expenses" enable row level security;


  create table "public"."job_persons" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "job_id" uuid not null,
    "user_id" uuid not null,
    "is_primary" boolean not null default false,
    "person_name" text not null,
    "role" text not null default 'adult'::text,
    "sex" text,
    "age" text,
    "item_type" text,
    "description" text,
    "measurement_kind" text not null default 'body'::text,
    "measurement_unit" text not null default 'inches'::text,
    "quantity" integer not null default 1,
    "measurements" jsonb not null default '{}'::jsonb,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "client_id" uuid,
    "name" text
      );


alter table "public"."job_persons" enable row level security;


  create table "public"."job_reference_photos" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "job_id" uuid not null,
    "user_id" uuid not null,
    "storage_path" text not null,
    "file_name" text,
    "mime_type" text,
    "size_bytes" integer,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."job_reference_photos" enable row level security;


  create table "public"."jobs" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "client_id" uuid,
    "client_name" text not null,
    "client_phone" text,
    "client_phone_normalized" text,
    "order_mode" text not null default 'New Stitch'::text,
    "make_category" text not null default 'Body Wear'::text,
    "order_scope" text not null default 'Single'::text,
    "item_type" text,
    "same_item_for_all" boolean not null default true,
    "amendment_issue_type" text,
    "amendment_area" text,
    "amendment_target" text,
    "amendment_description" text,
    "amendment_needs_materials" boolean not null default false,
    "amendment_part_name" text,
    "amendment_part_quantity" text,
    "material_type" text,
    "custom_material_type" text,
    "material_color" text,
    "material_yards" numeric(10,2),
    "material_quality" text,
    "material_source" text,
    "charge_amount_kobo" integer not null default 0,
    "deposit_percent" numeric(5,2) not null default 0,
    "deposit_amount_kobo" integer not null default 0,
    "balance_amount_kobo" integer generated always as (GREATEST((charge_amount_kobo - deposit_amount_kobo), 0)) stored,
    "total_expenses_kobo" integer not null default 0,
    "profit_kobo" integer generated always as ((charge_amount_kobo - total_expenses_kobo)) stored,
    "is_worth_it" boolean default true,
    "worth_it_note" text,
    "deadline_date" date,
    "deadline_time" time without time zone,
    "reminder" text not null default '1 day before'::text,
    "status" text not null default 'draft'::text,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1,
    "description" text,
    "title" text
      );


alter table "public"."jobs" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "title" text not null,
    "message" text not null,
    "type" text not null default 'general'::text,
    "action_url" text,
    "job_id" uuid,
    "read_at" timestamp with time zone,
    "scheduled_for" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."notifications" enable row level security;


  create table "public"."plan_features" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "plan_name" text not null,
    "feature_key" text not null,
    "is_enabled" boolean not null default true
      );


alter table "public"."plan_features" enable row level security;


  create table "public"."plans" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "display_name" text not null,
    "monthly_price_kobo" integer not null default 0,
    "yearly_price_kobo" integer not null default 0,
    "trial_days" integer not null default 0,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."plans" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "user_id" uuid not null,
    "full_name" text not null default ''::text,
    "email" text,
    "phone" text,
    "phone_normalized" text,
    "avatar_url" text,
    "onboarding_complete" boolean not null default false,
    "account_status" text not null default 'active'::text,
    "role" text not null default 'user'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1,
    "avatar_storage_path" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."subscriptions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "plan_name" text not null default 'trial'::text,
    "status" text not null default 'active'::text,
    "trial_ends_at" timestamp with time zone,
    "paystack_customer_code" text,
    "paystack_subscription_code" text,
    "is_tester" boolean default false,
    "tester_trial_ends_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."subscriptions" enable row level security;


  create table "public"."user_preferences" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "measurement_unit" text not null default 'inches'::text,
    "default_material_quality" text not null default 'Normal'::text,
    "dark_mode" boolean not null default false,
    "push_notifications" boolean not null default true,
    "default_reminder" text not null default '1 day before'::text,
    "ringtone_enabled" boolean not null default true,
    "ringtone" text not null default 'Classic Ring'::text,
    "notification_bell_enabled" boolean not null default true,
    "notification_bell" text not null default 'Standard Bell'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_preferences" enable row level security;

CREATE UNIQUE INDEX brand_settings_pkey ON public.brand_settings USING btree (id);

CREATE UNIQUE INDEX brand_settings_user_id_key ON public.brand_settings USING btree (user_id);

CREATE UNIQUE INDEX business_profiles_pkey ON public.business_profiles USING btree (id);

CREATE UNIQUE INDEX business_profiles_user_id_key ON public.business_profiles USING btree (user_id);

CREATE UNIQUE INDEX business_social_handles_pkey ON public.business_social_handles USING btree (id);

CREATE UNIQUE INDEX business_social_handles_user_id_platform_handle_key ON public.business_social_handles USING btree (user_id, platform, handle);

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

CREATE UNIQUE INDEX documents_user_id_document_number_key ON public.documents USING btree (user_id, document_number);

CREATE INDEX idx_clients_name_active ON public.clients USING btree (user_id, name) WHERE (deleted_at IS NULL);

CREATE INDEX idx_clients_phone_normalized ON public.clients USING btree (user_id, phone_normalized) WHERE (deleted_at IS NULL);

CREATE INDEX idx_clients_user_id_active ON public.clients USING btree (user_id) WHERE (deleted_at IS NULL);

CREATE INDEX idx_documents_job ON public.documents USING btree (job_id);

CREATE INDEX idx_documents_user_type ON public.documents USING btree (user_id, type);

CREATE INDEX idx_job_expenses_job ON public.job_expenses USING btree (job_id);

CREATE INDEX idx_job_persons_job ON public.job_persons USING btree (job_id);

CREATE INDEX idx_job_persons_user ON public.job_persons USING btree (user_id);

CREATE INDEX idx_job_reference_photos_job ON public.job_reference_photos USING btree (job_id);

CREATE INDEX idx_jobs_client_id_active ON public.jobs USING btree (client_id) WHERE (deleted_at IS NULL);

CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (user_id, created_at DESC);

CREATE INDEX idx_jobs_deadline_active ON public.jobs USING btree (user_id, deadline_date) WHERE (deleted_at IS NULL);

CREATE INDEX idx_jobs_order_scope ON public.jobs USING btree (user_id, order_scope) WHERE (deleted_at IS NULL);

CREATE INDEX idx_jobs_status_active ON public.jobs USING btree (user_id, status) WHERE (deleted_at IS NULL);

CREATE INDEX idx_jobs_updated_at ON public.jobs USING btree (user_id, updated_at DESC);

CREATE INDEX idx_jobs_user_id_active ON public.jobs USING btree (user_id) WHERE (deleted_at IS NULL);

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at) WHERE ((read_at IS NULL) AND (deleted_at IS NULL));

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);

CREATE INDEX idx_subscriptions_user ON public.subscriptions USING btree (user_id);

CREATE UNIQUE INDEX job_expenses_pkey ON public.job_expenses USING btree (id);

CREATE UNIQUE INDEX job_persons_pkey ON public.job_persons USING btree (id);

CREATE UNIQUE INDEX job_reference_photos_pkey ON public.job_reference_photos USING btree (id);

CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX plan_features_pkey ON public.plan_features USING btree (id);

CREATE UNIQUE INDEX plan_features_plan_name_feature_key_key ON public.plan_features USING btree (plan_name, feature_key);

CREATE UNIQUE INDEX plans_name_key ON public.plans USING btree (name);

CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX subscriptions_user_id_key ON public.subscriptions USING btree (user_id);

CREATE UNIQUE INDEX user_preferences_pkey ON public.user_preferences USING btree (id);

CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id);

alter table "public"."brand_settings" add constraint "brand_settings_pkey" PRIMARY KEY using index "brand_settings_pkey";

alter table "public"."business_profiles" add constraint "business_profiles_pkey" PRIMARY KEY using index "business_profiles_pkey";

alter table "public"."business_social_handles" add constraint "business_social_handles_pkey" PRIMARY KEY using index "business_social_handles_pkey";

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

alter table "public"."job_expenses" add constraint "job_expenses_pkey" PRIMARY KEY using index "job_expenses_pkey";

alter table "public"."job_persons" add constraint "job_persons_pkey" PRIMARY KEY using index "job_persons_pkey";

alter table "public"."job_reference_photos" add constraint "job_reference_photos_pkey" PRIMARY KEY using index "job_reference_photos_pkey";

alter table "public"."jobs" add constraint "jobs_pkey" PRIMARY KEY using index "jobs_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."plan_features" add constraint "plan_features_pkey" PRIMARY KEY using index "plan_features_pkey";

alter table "public"."plans" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."user_preferences" add constraint "user_preferences_pkey" PRIMARY KEY using index "user_preferences_pkey";

alter table "public"."brand_settings" add constraint "brand_settings_document_template_check" CHECK ((document_template = 'classic-wave'::text)) not valid;

alter table "public"."brand_settings" validate constraint "brand_settings_document_template_check";

alter table "public"."brand_settings" add constraint "brand_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."brand_settings" validate constraint "brand_settings_user_id_fkey";

alter table "public"."brand_settings" add constraint "brand_settings_user_id_key" UNIQUE using index "brand_settings_user_id_key";

alter table "public"."business_profiles" add constraint "business_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."business_profiles" validate constraint "business_profiles_user_id_fkey";

alter table "public"."business_profiles" add constraint "business_profiles_user_id_key" UNIQUE using index "business_profiles_user_id_key";

alter table "public"."business_social_handles" add constraint "business_social_handles_platform_check" CHECK ((platform = ANY (ARRAY['Instagram'::text, 'Facebook'::text, 'TikTok'::text]))) not valid;

alter table "public"."business_social_handles" validate constraint "business_social_handles_platform_check";

alter table "public"."business_social_handles" add constraint "business_social_handles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."business_social_handles" validate constraint "business_social_handles_user_id_fkey";

alter table "public"."business_social_handles" add constraint "business_social_handles_user_id_platform_handle_key" UNIQUE using index "business_social_handles_user_id_platform_handle_key";

alter table "public"."clients" add constraint "clients_measurement_unit_check" CHECK ((measurement_unit = ANY (ARRAY['cm'::text, 'inches'::text]))) not valid;

alter table "public"."clients" validate constraint "clients_measurement_unit_check";

alter table "public"."clients" add constraint "clients_sex_check" CHECK ((sex = ANY (ARRAY['Male'::text, 'Female'::text]))) not valid;

alter table "public"."clients" validate constraint "clients_sex_check";

alter table "public"."clients" add constraint "clients_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_user_id_fkey";

alter table "public"."documents" add constraint "documents_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_job_id_fkey";

alter table "public"."documents" add constraint "documents_type_check" CHECK ((type = ANY (ARRAY['invoice'::text, 'receipt'::text]))) not valid;

alter table "public"."documents" validate constraint "documents_type_check";

alter table "public"."documents" add constraint "documents_user_id_document_number_key" UNIQUE using index "documents_user_id_document_number_key";

alter table "public"."documents" add constraint "documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_user_id_fkey";

alter table "public"."job_expenses" add constraint "job_expenses_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE not valid;

alter table "public"."job_expenses" validate constraint "job_expenses_job_id_fkey";

alter table "public"."job_expenses" add constraint "job_expenses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."job_expenses" validate constraint "job_expenses_user_id_fkey";

alter table "public"."job_persons" add constraint "job_persons_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE not valid;

alter table "public"."job_persons" validate constraint "job_persons_job_id_fkey";

alter table "public"."job_persons" add constraint "job_persons_measurement_kind_check" CHECK ((measurement_kind = ANY (ARRAY['body'::text, 'non_body'::text]))) not valid;

alter table "public"."job_persons" validate constraint "job_persons_measurement_kind_check";

alter table "public"."job_persons" add constraint "job_persons_measurement_unit_check" CHECK ((measurement_unit = ANY (ARRAY['cm'::text, 'inches'::text]))) not valid;

alter table "public"."job_persons" validate constraint "job_persons_measurement_unit_check";

alter table "public"."job_persons" add constraint "job_persons_role_check" CHECK ((role = ANY (ARRAY['adult'::text, 'child'::text]))) not valid;

alter table "public"."job_persons" validate constraint "job_persons_role_check";

alter table "public"."job_persons" add constraint "job_persons_sex_check" CHECK ((sex = ANY (ARRAY['Male'::text, 'Female'::text, 'Boy'::text, 'Girl'::text]))) not valid;

alter table "public"."job_persons" validate constraint "job_persons_sex_check";

alter table "public"."job_persons" add constraint "job_persons_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."job_persons" validate constraint "job_persons_user_id_fkey";

alter table "public"."job_reference_photos" add constraint "job_reference_photos_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE not valid;

alter table "public"."job_reference_photos" validate constraint "job_reference_photos_job_id_fkey";

alter table "public"."job_reference_photos" add constraint "job_reference_photos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."job_reference_photos" validate constraint "job_reference_photos_user_id_fkey";

alter table "public"."jobs" add constraint "jobs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."jobs" validate constraint "jobs_client_id_fkey";

alter table "public"."jobs" add constraint "jobs_make_category_check" CHECK ((make_category = ANY (ARRAY['Body Wear'::text, 'Non-Body Item'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_make_category_check";

alter table "public"."jobs" add constraint "jobs_material_quality_check" CHECK ((material_quality = ANY (ARRAY['Normal'::text, 'Original'::text, 'Fake'::text, 'High Standard'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_material_quality_check";

alter table "public"."jobs" add constraint "jobs_material_source_check" CHECK ((material_source = ANY (ARRAY['Client is Providing Material'::text, 'I Am Getting It'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_material_source_check";

alter table "public"."jobs" add constraint "jobs_order_mode_check" CHECK ((order_mode = ANY (ARRAY['New Stitch'::text, 'Amendment / Repair'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_order_mode_check";

alter table "public"."jobs" add constraint "jobs_order_scope_check" CHECK ((order_scope = ANY (ARRAY['Single'::text, 'Couple'::text, 'Family'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_order_scope_check";

alter table "public"."jobs" add constraint "jobs_reminder_check" CHECK ((reminder = ANY (ARRAY['1 day before'::text, '3 days before'::text, '1 week before'::text, 'none'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_reminder_check";

alter table "public"."jobs" add constraint "jobs_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_status_check";

alter table "public"."jobs" add constraint "jobs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."jobs" validate constraint "jobs_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL not valid;

alter table "public"."notifications" validate constraint "notifications_job_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK ((type = ANY (ARRAY['deadline'::text, 'balance'::text, 'invoice'::text, 'account'::text, 'general'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."plan_features" add constraint "plan_features_plan_name_feature_key_key" UNIQUE using index "plan_features_plan_name_feature_key_key";

alter table "public"."plan_features" add constraint "plan_features_plan_name_fkey" FOREIGN KEY (plan_name) REFERENCES public.plans(name) ON DELETE CASCADE not valid;

alter table "public"."plan_features" validate constraint "plan_features_plan_name_fkey";

alter table "public"."plans" add constraint "plans_name_check" CHECK ((name = ANY (ARRAY['free'::text, 'starter'::text, 'pro'::text]))) not valid;

alter table "public"."plans" validate constraint "plans_name_check";

alter table "public"."plans" add constraint "plans_name_key" UNIQUE using index "plans_name_key";

alter table "public"."profiles" add constraint "profiles_account_status_check" CHECK ((account_status = ANY (ARRAY['active'::text, 'deactivated'::text, 'deleted'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_account_status_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_key" UNIQUE using index "profiles_user_id_key";

alter table "public"."subscriptions" add constraint "subscriptions_plan_name_fkey" FOREIGN KEY (plan_name) REFERENCES public.plans(name) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_plan_name_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_key" UNIQUE using index "subscriptions_user_id_key";

alter table "public"."user_preferences" add constraint "user_preferences_default_material_quality_check" CHECK ((default_material_quality = ANY (ARRAY['Normal'::text, 'Original'::text, 'Fake'::text, 'High Standard'::text]))) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_default_material_quality_check";

alter table "public"."user_preferences" add constraint "user_preferences_default_reminder_check" CHECK ((default_reminder = ANY (ARRAY['1 day before'::text, '3 days before'::text, '1 week before'::text, 'none'::text]))) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_default_reminder_check";

alter table "public"."user_preferences" add constraint "user_preferences_measurement_unit_check" CHECK ((measurement_unit = ANY (ARRAY['inches'::text, 'cm'::text]))) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_measurement_unit_check";

alter table "public"."user_preferences" add constraint "user_preferences_notification_bell_check" CHECK ((notification_bell = ANY (ARRAY['Standard Bell'::text, 'Soft Bell'::text, 'Sharp Bell'::text]))) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_notification_bell_check";

alter table "public"."user_preferences" add constraint "user_preferences_ringtone_check" CHECK ((ringtone = ANY (ARRAY['Classic Ring'::text, 'Soft Chime'::text, 'Pulse Tone'::text]))) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_ringtone_check";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_key" UNIQUE using index "user_preferences_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, user_id, full_name, email)
  select
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  where not exists (
    select 1 from public.profiles where user_id = new.id
  );

  insert into public.business_profiles (user_id)
  select new.id
  where not exists (
    select 1 from public.business_profiles where user_id = new.id
  );

  insert into public.user_preferences (user_id)
  select new.id
  where not exists (
    select 1 from public.user_preferences where user_id = new.id
  );

  insert into public.brand_settings (user_id)
  select new.id
  where not exists (
    select 1 from public.brand_settings where user_id = new.id
  );

  insert into public.subscriptions (user_id, plan_name, status, trial_ends_at)
  select
    new.id,
    'free',
    'active',
    now() + interval '14 days'
  where not exists (
    select 1 from public.subscriptions where user_id = new.id
  );

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_job_expense_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  affected_job_id UUID;
BEGIN
  affected_job_id := COALESCE(NEW.job_id, OLD.job_id);

  UPDATE jobs
  SET
    total_expenses_kobo = COALESCE((
      SELECT SUM(cost_amount_kobo)
      FROM job_expenses
      WHERE job_id = affected_job_id
    ), 0),
    updated_at = NOW(),
    version = version + 1
  WHERE id = affected_job_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_and_version()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."brand_settings" to "anon";

grant insert on table "public"."brand_settings" to "anon";

grant references on table "public"."brand_settings" to "anon";

grant select on table "public"."brand_settings" to "anon";

grant trigger on table "public"."brand_settings" to "anon";

grant truncate on table "public"."brand_settings" to "anon";

grant update on table "public"."brand_settings" to "anon";

grant delete on table "public"."brand_settings" to "authenticated";

grant insert on table "public"."brand_settings" to "authenticated";

grant references on table "public"."brand_settings" to "authenticated";

grant select on table "public"."brand_settings" to "authenticated";

grant trigger on table "public"."brand_settings" to "authenticated";

grant truncate on table "public"."brand_settings" to "authenticated";

grant update on table "public"."brand_settings" to "authenticated";

grant delete on table "public"."brand_settings" to "service_role";

grant insert on table "public"."brand_settings" to "service_role";

grant references on table "public"."brand_settings" to "service_role";

grant select on table "public"."brand_settings" to "service_role";

grant trigger on table "public"."brand_settings" to "service_role";

grant truncate on table "public"."brand_settings" to "service_role";

grant update on table "public"."brand_settings" to "service_role";

grant delete on table "public"."business_profiles" to "anon";

grant insert on table "public"."business_profiles" to "anon";

grant references on table "public"."business_profiles" to "anon";

grant select on table "public"."business_profiles" to "anon";

grant trigger on table "public"."business_profiles" to "anon";

grant truncate on table "public"."business_profiles" to "anon";

grant update on table "public"."business_profiles" to "anon";

grant delete on table "public"."business_profiles" to "authenticated";

grant insert on table "public"."business_profiles" to "authenticated";

grant references on table "public"."business_profiles" to "authenticated";

grant select on table "public"."business_profiles" to "authenticated";

grant trigger on table "public"."business_profiles" to "authenticated";

grant truncate on table "public"."business_profiles" to "authenticated";

grant update on table "public"."business_profiles" to "authenticated";

grant delete on table "public"."business_profiles" to "service_role";

grant insert on table "public"."business_profiles" to "service_role";

grant references on table "public"."business_profiles" to "service_role";

grant select on table "public"."business_profiles" to "service_role";

grant trigger on table "public"."business_profiles" to "service_role";

grant truncate on table "public"."business_profiles" to "service_role";

grant update on table "public"."business_profiles" to "service_role";

grant delete on table "public"."business_social_handles" to "anon";

grant insert on table "public"."business_social_handles" to "anon";

grant references on table "public"."business_social_handles" to "anon";

grant select on table "public"."business_social_handles" to "anon";

grant trigger on table "public"."business_social_handles" to "anon";

grant truncate on table "public"."business_social_handles" to "anon";

grant update on table "public"."business_social_handles" to "anon";

grant delete on table "public"."business_social_handles" to "authenticated";

grant insert on table "public"."business_social_handles" to "authenticated";

grant references on table "public"."business_social_handles" to "authenticated";

grant select on table "public"."business_social_handles" to "authenticated";

grant trigger on table "public"."business_social_handles" to "authenticated";

grant truncate on table "public"."business_social_handles" to "authenticated";

grant update on table "public"."business_social_handles" to "authenticated";

grant delete on table "public"."business_social_handles" to "service_role";

grant insert on table "public"."business_social_handles" to "service_role";

grant references on table "public"."business_social_handles" to "service_role";

grant select on table "public"."business_social_handles" to "service_role";

grant trigger on table "public"."business_social_handles" to "service_role";

grant truncate on table "public"."business_social_handles" to "service_role";

grant update on table "public"."business_social_handles" to "service_role";

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant references on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant trigger on table "public"."documents" to "anon";

grant truncate on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant references on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant trigger on table "public"."documents" to "authenticated";

grant truncate on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant references on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant trigger on table "public"."documents" to "service_role";

grant truncate on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";

grant delete on table "public"."job_expenses" to "anon";

grant insert on table "public"."job_expenses" to "anon";

grant references on table "public"."job_expenses" to "anon";

grant select on table "public"."job_expenses" to "anon";

grant trigger on table "public"."job_expenses" to "anon";

grant truncate on table "public"."job_expenses" to "anon";

grant update on table "public"."job_expenses" to "anon";

grant delete on table "public"."job_expenses" to "authenticated";

grant insert on table "public"."job_expenses" to "authenticated";

grant references on table "public"."job_expenses" to "authenticated";

grant select on table "public"."job_expenses" to "authenticated";

grant trigger on table "public"."job_expenses" to "authenticated";

grant truncate on table "public"."job_expenses" to "authenticated";

grant update on table "public"."job_expenses" to "authenticated";

grant delete on table "public"."job_expenses" to "service_role";

grant insert on table "public"."job_expenses" to "service_role";

grant references on table "public"."job_expenses" to "service_role";

grant select on table "public"."job_expenses" to "service_role";

grant trigger on table "public"."job_expenses" to "service_role";

grant truncate on table "public"."job_expenses" to "service_role";

grant update on table "public"."job_expenses" to "service_role";

grant delete on table "public"."job_persons" to "anon";

grant insert on table "public"."job_persons" to "anon";

grant references on table "public"."job_persons" to "anon";

grant select on table "public"."job_persons" to "anon";

grant trigger on table "public"."job_persons" to "anon";

grant truncate on table "public"."job_persons" to "anon";

grant update on table "public"."job_persons" to "anon";

grant delete on table "public"."job_persons" to "authenticated";

grant insert on table "public"."job_persons" to "authenticated";

grant references on table "public"."job_persons" to "authenticated";

grant select on table "public"."job_persons" to "authenticated";

grant trigger on table "public"."job_persons" to "authenticated";

grant truncate on table "public"."job_persons" to "authenticated";

grant update on table "public"."job_persons" to "authenticated";

grant delete on table "public"."job_persons" to "service_role";

grant insert on table "public"."job_persons" to "service_role";

grant references on table "public"."job_persons" to "service_role";

grant select on table "public"."job_persons" to "service_role";

grant trigger on table "public"."job_persons" to "service_role";

grant truncate on table "public"."job_persons" to "service_role";

grant update on table "public"."job_persons" to "service_role";

grant delete on table "public"."job_reference_photos" to "anon";

grant insert on table "public"."job_reference_photos" to "anon";

grant references on table "public"."job_reference_photos" to "anon";

grant select on table "public"."job_reference_photos" to "anon";

grant trigger on table "public"."job_reference_photos" to "anon";

grant truncate on table "public"."job_reference_photos" to "anon";

grant update on table "public"."job_reference_photos" to "anon";

grant delete on table "public"."job_reference_photos" to "authenticated";

grant insert on table "public"."job_reference_photos" to "authenticated";

grant references on table "public"."job_reference_photos" to "authenticated";

grant select on table "public"."job_reference_photos" to "authenticated";

grant trigger on table "public"."job_reference_photos" to "authenticated";

grant truncate on table "public"."job_reference_photos" to "authenticated";

grant update on table "public"."job_reference_photos" to "authenticated";

grant delete on table "public"."job_reference_photos" to "service_role";

grant insert on table "public"."job_reference_photos" to "service_role";

grant references on table "public"."job_reference_photos" to "service_role";

grant select on table "public"."job_reference_photos" to "service_role";

grant trigger on table "public"."job_reference_photos" to "service_role";

grant truncate on table "public"."job_reference_photos" to "service_role";

grant update on table "public"."job_reference_photos" to "service_role";

grant delete on table "public"."jobs" to "anon";

grant insert on table "public"."jobs" to "anon";

grant references on table "public"."jobs" to "anon";

grant select on table "public"."jobs" to "anon";

grant trigger on table "public"."jobs" to "anon";

grant truncate on table "public"."jobs" to "anon";

grant update on table "public"."jobs" to "anon";

grant delete on table "public"."jobs" to "authenticated";

grant insert on table "public"."jobs" to "authenticated";

grant references on table "public"."jobs" to "authenticated";

grant select on table "public"."jobs" to "authenticated";

grant trigger on table "public"."jobs" to "authenticated";

grant truncate on table "public"."jobs" to "authenticated";

grant update on table "public"."jobs" to "authenticated";

grant delete on table "public"."jobs" to "service_role";

grant insert on table "public"."jobs" to "service_role";

grant references on table "public"."jobs" to "service_role";

grant select on table "public"."jobs" to "service_role";

grant trigger on table "public"."jobs" to "service_role";

grant truncate on table "public"."jobs" to "service_role";

grant update on table "public"."jobs" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."plan_features" to "anon";

grant insert on table "public"."plan_features" to "anon";

grant references on table "public"."plan_features" to "anon";

grant select on table "public"."plan_features" to "anon";

grant trigger on table "public"."plan_features" to "anon";

grant truncate on table "public"."plan_features" to "anon";

grant update on table "public"."plan_features" to "anon";

grant delete on table "public"."plan_features" to "authenticated";

grant insert on table "public"."plan_features" to "authenticated";

grant references on table "public"."plan_features" to "authenticated";

grant select on table "public"."plan_features" to "authenticated";

grant trigger on table "public"."plan_features" to "authenticated";

grant truncate on table "public"."plan_features" to "authenticated";

grant update on table "public"."plan_features" to "authenticated";

grant delete on table "public"."plan_features" to "service_role";

grant insert on table "public"."plan_features" to "service_role";

grant references on table "public"."plan_features" to "service_role";

grant select on table "public"."plan_features" to "service_role";

grant trigger on table "public"."plan_features" to "service_role";

grant truncate on table "public"."plan_features" to "service_role";

grant update on table "public"."plan_features" to "service_role";

grant delete on table "public"."plans" to "anon";

grant insert on table "public"."plans" to "anon";

grant references on table "public"."plans" to "anon";

grant select on table "public"."plans" to "anon";

grant trigger on table "public"."plans" to "anon";

grant truncate on table "public"."plans" to "anon";

grant update on table "public"."plans" to "anon";

grant delete on table "public"."plans" to "authenticated";

grant insert on table "public"."plans" to "authenticated";

grant references on table "public"."plans" to "authenticated";

grant select on table "public"."plans" to "authenticated";

grant trigger on table "public"."plans" to "authenticated";

grant truncate on table "public"."plans" to "authenticated";

grant update on table "public"."plans" to "authenticated";

grant delete on table "public"."plans" to "service_role";

grant insert on table "public"."plans" to "service_role";

grant references on table "public"."plans" to "service_role";

grant select on table "public"."plans" to "service_role";

grant trigger on table "public"."plans" to "service_role";

grant truncate on table "public"."plans" to "service_role";

grant update on table "public"."plans" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."user_preferences" to "anon";

grant insert on table "public"."user_preferences" to "anon";

grant references on table "public"."user_preferences" to "anon";

grant select on table "public"."user_preferences" to "anon";

grant trigger on table "public"."user_preferences" to "anon";

grant truncate on table "public"."user_preferences" to "anon";

grant update on table "public"."user_preferences" to "anon";

grant delete on table "public"."user_preferences" to "authenticated";

grant insert on table "public"."user_preferences" to "authenticated";

grant references on table "public"."user_preferences" to "authenticated";

grant select on table "public"."user_preferences" to "authenticated";

grant trigger on table "public"."user_preferences" to "authenticated";

grant truncate on table "public"."user_preferences" to "authenticated";

grant update on table "public"."user_preferences" to "authenticated";

grant delete on table "public"."user_preferences" to "service_role";

grant insert on table "public"."user_preferences" to "service_role";

grant references on table "public"."user_preferences" to "service_role";

grant select on table "public"."user_preferences" to "service_role";

grant trigger on table "public"."user_preferences" to "service_role";

grant truncate on table "public"."user_preferences" to "service_role";

grant update on table "public"."user_preferences" to "service_role";


  create policy "Users manage own brand settings"
  on "public"."brand_settings"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own business profiles"
  on "public"."business_profiles"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own business social handles"
  on "public"."business_social_handles"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can insert own clients"
  on "public"."clients"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own clients"
  on "public"."clients"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view active own clients"
  on "public"."clients"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) AND (deleted_at IS NULL)));



  create policy "Users manage own documents"
  on "public"."documents"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own job expenses"
  on "public"."job_expenses"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own job persons"
  on "public"."job_persons"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own job reference photos"
  on "public"."job_reference_photos"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can insert own jobs"
  on "public"."jobs"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own jobs"
  on "public"."jobs"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view active own jobs"
  on "public"."jobs"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) AND (deleted_at IS NULL)));



  create policy "Users manage own notifications"
  on "public"."notifications"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Users can read own profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can insert own subscription"
  on "public"."subscriptions"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Users can read own subscription"
  on "public"."subscriptions"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can update own subscription"
  on "public"."subscriptions"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view own subscription"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users manage own user preferences"
  on "public"."user_preferences"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON public.brand_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_business_social_handles_updated_at BEFORE UPDATE ON public.business_social_handles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER job_expenses_refresh_totals AFTER INSERT OR DELETE OR UPDATE ON public.job_expenses FOR EACH ROW EXECUTE FUNCTION public.refresh_job_expense_totals();

CREATE TRIGGER update_job_expenses_updated_at BEFORE UPDATE ON public.job_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_job_persons_updated_at BEFORE UPDATE ON public.job_persons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Users can delete own TailorDeck storage files"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can delete own storage files"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can read own storage files"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update own TailorDeck storage files"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
with check (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can update own storage files"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((auth.uid())::text = (storage.foldername(name))[1])))
with check (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload own TailorDeck storage files"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload own storage files"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can view own TailorDeck storage files"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = ANY (ARRAY['avatars'::text, 'brand-assets'::text, 'job-photos'::text, 'documents'::text])) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



