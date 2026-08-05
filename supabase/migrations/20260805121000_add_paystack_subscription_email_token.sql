alter table public.subscriptions
  add column if not exists paystack_email_token text;
