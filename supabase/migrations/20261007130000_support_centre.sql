-- Support centre (/admin/support, role 'support'): replies to tickets, shown in the app and emailed to the user.
-- Replies are written only by the support-reply Edge Function (service role), which also sends the email
-- and the in-app notification. Support admins read every ticket and change its status here.

create table if not exists public.support_ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists support_ticket_replies_ticket_created_idx
  on public.support_ticket_replies (ticket_id, created_at);

alter table public.support_tickets add column if not exists last_reply_at timestamptz;

alter table public.support_ticket_replies enable row level security;

-- Users read replies on their own tickets; support admins read all.
drop policy if exists "Users read replies on own tickets" on public.support_ticket_replies;
create policy "Users read replies on own tickets"
  on public.support_ticket_replies for select
  to authenticated
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid() and t.deleted_at is null
    )
    or public.is_admin('support')
  );

revoke all on public.support_ticket_replies from anon;
revoke insert, update, delete, truncate on public.support_ticket_replies from authenticated;
grant select on public.support_ticket_replies to authenticated;

-- Support admins read every ticket and may change only its status.
drop policy if exists "Support admins read all tickets" on public.support_tickets;
create policy "Support admins read all tickets"
  on public.support_tickets for select
  to authenticated
  using (public.is_admin('support'));

drop policy if exists "Support admins update ticket status" on public.support_tickets;
create policy "Support admins update ticket status"
  on public.support_tickets for update
  to authenticated
  using (public.is_admin('support'))
  with check (public.is_admin('support'));

grant update (status) on public.support_tickets to authenticated;
