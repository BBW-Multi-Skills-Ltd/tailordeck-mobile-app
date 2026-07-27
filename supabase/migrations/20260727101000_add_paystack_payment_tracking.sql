alter table public.subscriptions
  add column if not exists payment_status text not null default 'none',
  add column if not exists pending_payment_reference text,
  add column if not exists last_payment_reference text,
  add column if not exists last_payment_at timestamp with time zone,
  add column if not exists paystack_plan_code text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_payment_status_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_payment_status_check
      check (payment_status in ('none', 'pending', 'paid', 'failed'));
  end if;
end $$;
