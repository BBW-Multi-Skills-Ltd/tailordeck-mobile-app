-- Store Google Play subscription verification metadata without changing existing RLS or Paystack state.

alter table public.subscriptions
  add column if not exists billing_provider text not null default 'internal',
  add column if not exists current_period_end timestamptz,
  add column if not exists google_play_product_id text,
  add column if not exists google_play_base_plan_id text,
  add column if not exists google_play_purchase_token text,
  add column if not exists google_play_order_id text,
  add column if not exists google_play_subscription_state text,
  add column if not exists google_play_last_verified_at timestamptz;

alter table public.subscriptions alter column billing_provider set default 'internal';
update public.subscriptions set billing_provider = 'internal' where billing_provider is null;
alter table public.subscriptions alter column billing_provider set not null;

do $$
declare
  conditions text[] := array[]::text[];
  predicate text;
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'paystack_customer_code'
  ) then
    conditions := conditions || array['paystack_customer_code is not null'];
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'paystack_subscription_code'
  ) then
    conditions := conditions || array['paystack_subscription_code is not null'];
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'paystack_email_token'
  ) then
    conditions := conditions || array['paystack_email_token is not null'];
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'pending_payment_reference'
  ) then
    conditions := conditions || array['pending_payment_reference is not null'];
  end if;

  if array_length(conditions, 1) is not null then
    predicate := array_to_string(conditions, ' or ');
    execute format(
      'update public.subscriptions set billing_provider = %L where billing_provider = %L and (%s)',
      'paystack',
      'internal',
      predicate
    );
  end if;
end $$;

alter table public.subscriptions
  drop constraint if exists subscriptions_billing_provider_check;

alter table public.subscriptions
  add constraint subscriptions_billing_provider_check
  check (billing_provider in ('internal', 'paystack', 'google_play'));

alter table public.subscriptions
  drop constraint if exists subscriptions_google_play_product_id_check;

alter table public.subscriptions
  add constraint subscriptions_google_play_product_id_check
  check (
    google_play_product_id is null
    or google_play_product_id in ('tailordeck_starter', 'tailordeck_pro')
  );

alter table public.subscriptions
  drop constraint if exists subscriptions_google_play_base_plan_id_check;

alter table public.subscriptions
  add constraint subscriptions_google_play_base_plan_id_check
  check (
    google_play_base_plan_id is null
    or google_play_base_plan_id in ('monthly', 'yearly')
  );

create unique index if not exists subscriptions_google_play_purchase_token_key
  on public.subscriptions (google_play_purchase_token)
  where google_play_purchase_token is not null;

create index if not exists subscriptions_google_play_order_id_idx
  on public.subscriptions (google_play_order_id)
  where google_play_order_id is not null;
