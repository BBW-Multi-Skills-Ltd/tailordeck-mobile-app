create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  priority text not null default 'normal',
  status text not null default 'open',
  subject text not null,
  message text not null,
  account_email text,
  contact_phone text,
  page_url text,
  device_info jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint support_tickets_category_check check (category in ('billing', 'bug', 'feedback', 'account', 'general')),
  constraint support_tickets_priority_check check (priority in ('normal', 'urgent')),
  constraint support_tickets_status_check check (status in ('open', 'in_review', 'resolved', 'closed')),
  constraint support_tickets_subject_check check (char_length(btrim(subject)) between 3 and 120),
  constraint support_tickets_message_check check (char_length(btrim(message)) between 10 and 2000)
);

create index if not exists idx_support_tickets_user_created
on public.support_tickets (user_id, created_at desc)
where deleted_at is null;

create index if not exists idx_support_tickets_status_created
on public.support_tickets (status, created_at desc)
where deleted_at is null;

drop trigger if exists update_support_tickets_updated_at on public.support_tickets;
create trigger update_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.update_updated_at();

create or replace function public.enforce_support_ticket_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*)
  into recent_count
  from public.support_tickets
  where user_id = new.user_id
    and created_at >= now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception 'Too many support requests. Please wait before sending another one.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_support_ticket_rate_limit on public.support_tickets;
create trigger enforce_support_ticket_rate_limit
before insert on public.support_tickets
for each row execute function public.enforce_support_ticket_rate_limit();

alter table public.support_tickets enable row level security;

revoke insert, update, delete, truncate on table public.support_tickets from anon;
revoke references, trigger on table public.support_tickets from anon;
grant select, insert on table public.support_tickets to authenticated;

drop policy if exists "Users can create own support tickets" on public.support_tickets;
create policy "Users can create own support tickets"
on public.support_tickets
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can view own support tickets" on public.support_tickets;
create policy "Users can view own support tickets"
on public.support_tickets
for select
to authenticated
using (auth.uid() = user_id and deleted_at is null);
