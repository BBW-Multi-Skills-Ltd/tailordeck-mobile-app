alter table public.subscriptions
  add column if not exists billing_cycle text not null default 'monthly',
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists current_period_ends_at timestamp with time zone;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_billing_cycle_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_billing_cycle_check
      check (billing_cycle in ('monthly', 'yearly'));
  end if;
end $$;
