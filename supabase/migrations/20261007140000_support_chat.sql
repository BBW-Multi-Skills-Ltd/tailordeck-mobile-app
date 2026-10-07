-- Support chat: two-way messages with attachments, push tokens, live updates and customer names for the inbox.
-- Users write through send_support_message (only while the ticket is open/in progress); support writes through
-- the support-reply Edge Function (push to the user's devices, email fallback, transcript email on resolve).

-- 1. Messages from both sides, with optional attachments.
alter table public.support_ticket_replies
  add column if not exists author_role text not null default 'support',
  add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table public.support_ticket_replies drop constraint if exists support_ticket_replies_body_check;
alter table public.support_ticket_replies drop constraint if exists support_ticket_replies_author_role_check;
alter table public.support_ticket_replies drop constraint if exists support_ticket_replies_content_check;
alter table public.support_ticket_replies
  add constraint support_ticket_replies_author_role_check check (author_role in ('support', 'user')),
  add constraint support_ticket_replies_content_check check (
    char_length(body) <= 4000
    and jsonb_typeof(attachments) = 'array'
    and jsonb_array_length(attachments) <= 5
    and (btrim(body) <> '' or jsonb_array_length(attachments) > 0)
  );

alter table public.support_tickets
  add column if not exists last_message_by text check (last_message_by in ('support', 'user')),
  add column if not exists transcript_emailed_at timestamptz;

-- 2. Private storage for attachments: <ticket id>/<file>. Photos and PDFs, up to 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments', 'support-attachments', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_access_support_ticket(ticket uuid, for_upload boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_admin('support')
    or exists (
      select 1 from public.support_tickets t
      where t.id = ticket
        and t.user_id = auth.uid()
        and t.deleted_at is null
        and (not for_upload or t.status in ('open', 'in_review'))
    );
$$;

revoke all on function public.can_access_support_ticket(uuid, boolean) from public, anon;
grant execute on function public.can_access_support_ticket(uuid, boolean) to authenticated;

create or replace function public.support_attachment_ticket(object_name text)
returns uuid
language plpgsql
immutable
set search_path = public, pg_temp
as $$
begin
  return split_part(object_name, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;

drop policy if exists "Support attachments upload" on storage.objects;
create policy "Support attachments upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'support-attachments'
    and public.can_access_support_ticket(public.support_attachment_ticket(name), true)
  );

drop policy if exists "Support attachments read" on storage.objects;
create policy "Support attachments read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'support-attachments'
    and public.can_access_support_ticket(public.support_attachment_ticket(name), false)
  );

-- 3. Users send chat messages here (not by inserting directly).
create or replace function public.send_support_message(ticket uuid, message_body text, message_attachments jsonb default '[]'::jsonb)
returns public.support_ticket_replies
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  owner_ticket public.support_tickets;
  recent integer;
  item jsonb;
  saved public.support_ticket_replies;
  clean_body text := btrim(coalesce(message_body, ''));
  clean_attachments jsonb := coalesce(message_attachments, '[]'::jsonb);
begin
  select * into owner_ticket from public.support_tickets
  where id = ticket and user_id = auth.uid() and deleted_at is null;
  if owner_ticket.id is null then
    raise exception 'Support request not found.' using errcode = 'P0002';
  end if;
  if owner_ticket.status not in ('open', 'in_review') then
    raise exception 'This request is resolved. Please start a new request.' using errcode = 'P0001';
  end if;

  select count(*) into recent from public.support_ticket_replies r
  join public.support_tickets t on t.id = r.ticket_id
  where t.user_id = auth.uid() and r.author_role = 'user' and r.created_at > now() - interval '1 hour';
  if recent >= 60 then
    raise exception 'Too many messages. Please wait a little before sending more.' using errcode = 'P0001';
  end if;

  if jsonb_typeof(clean_attachments) <> 'array' or jsonb_array_length(clean_attachments) > 5 then
    raise exception 'Up to 5 attachments per message.' using errcode = '22023';
  end if;
  -- Each attachment must be a file already uploaded to this ticket's folder.
  for item in select * from jsonb_array_elements(clean_attachments) loop
    if not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'support-attachments'
        and o.name = item ->> 'path'
        and split_part(o.name, '/', 1) = ticket::text
    ) then
      raise exception 'Attachment not found.' using errcode = '22023';
    end if;
  end loop;

  insert into public.support_ticket_replies (ticket_id, author_id, author_role, body, attachments)
  values (ticket, auth.uid(), 'user', clean_body, clean_attachments)
  returning * into saved;

  update public.support_tickets
  set last_reply_at = saved.created_at, last_message_by = 'user'
  where id = ticket;

  return saved;
end;
$$;

revoke all on function public.send_support_message(uuid, text, jsonb) from public, anon;
grant execute on function public.send_support_message(uuid, text, jsonb) to authenticated;

-- 4. Push notification device tokens (Firebase Cloud Messaging).
create table if not exists public.push_tokens (
  token text primary key check (char_length(token) between 20 and 4096),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null default 'android' check (platform in ('android', 'ios', 'web')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists push_tokens_user_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;
revoke all on public.push_tokens from anon, authenticated;

-- A device token belongs to whoever is signed in on that device now.
create or replace function public.register_push_token(device_token text, device_platform text default 'android')
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in.' using errcode = '42501';
  end if;
  insert into public.push_tokens (token, user_id, platform, last_seen_at)
  values (device_token, auth.uid(), coalesce(nullif(device_platform, ''), 'android'), now())
  on conflict (token) do update
    set user_id = excluded.user_id, platform = excluded.platform, last_seen_at = now();
end;
$$;

create or replace function public.unregister_push_token(device_token text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.push_tokens where token = device_token and user_id = auth.uid();
$$;

revoke all on function public.register_push_token(text, text) from public, anon;
revoke all on function public.unregister_push_token(text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;
grant execute on function public.unregister_push_token(text) to authenticated;

-- 5. Customer name and shop name for the support inbox (support admins only).
create or replace function public.get_support_ticket_contacts(ticket_ids uuid[])
returns table (ticket_id uuid, full_name text, shop_name text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select t.id,
    (select nullif(btrim(p.full_name), '') from public.profiles p where p.user_id = t.user_id limit 1),
    (select nullif(btrim(b.shop_name), '') from public.business_profiles b where b.user_id = t.user_id limit 1)
  from public.support_tickets t
  where public.is_admin('support') and t.id = any(ticket_ids);
$$;

revoke all on function public.get_support_ticket_contacts(uuid[]) from public, anon;
grant execute on function public.get_support_ticket_contacts(uuid[]) to authenticated;

-- 6. Live updates (Realtime respects RLS: users only receive their own tickets' messages).
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_ticket_replies') then
    alter publication supabase_realtime add table public.support_ticket_replies;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_tickets') then
    alter publication supabase_realtime add table public.support_tickets;
  end if;
end $$;
