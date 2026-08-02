-- Production hardening: remove unnecessary anonymous table writes, make plan config read-only,
-- and ensure child rows can only point at jobs owned by the authenticated user.

revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke references, trigger on all tables in schema public from anon;

revoke insert, update, delete, truncate on table public.plans from authenticated;
revoke insert, update, delete, truncate on table public.plan_features from authenticated;
revoke references, trigger on table public.plans from authenticated;
revoke references, trigger on table public.plan_features from authenticated;

grant select on table public.plans to anon, authenticated;
grant select on table public.plan_features to anon, authenticated;

drop policy if exists "Anyone can view active plans" on public.plans;
create policy "Anyone can view active plans"
on public.plans
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Anyone can view enabled plan features" on public.plan_features;
create policy "Anyone can view enabled plan features"
on public.plan_features
for select
to anon, authenticated
using (is_enabled = true);

-- Replace broad child table policies with policies that also verify the referenced job belongs to the same user.
drop policy if exists "Users manage own job expenses" on public.job_expenses;
create policy "Users manage own job expenses"
on public.job_expenses
for all
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.jobs j
    where j.id = job_expenses.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.jobs j
    where j.id = job_expenses.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
);

drop policy if exists "Users manage own job persons" on public.job_persons;
create policy "Users manage own job persons"
on public.job_persons
for all
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.jobs j
    where j.id = job_persons.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.jobs j
    where j.id = job_persons.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
  and (
    client_id is null
    or exists (
      select 1 from public.clients c
      where c.id = job_persons.client_id
        and c.user_id = auth.uid()
        and c.deleted_at is null
    )
  )
);

drop policy if exists "Users manage own job reference photos" on public.job_reference_photos;
create policy "Users manage own job reference photos"
on public.job_reference_photos
for all
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.jobs j
    where j.id = job_reference_photos.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
)
with check (
  auth.uid() = user_id
  and storage_path ~ ('^' || auth.uid()::text || '/')
  and exists (
    select 1 from public.jobs j
    where j.id = job_reference_photos.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
);

drop policy if exists "Users manage own documents" on public.documents;
create policy "Users manage own documents"
on public.documents
for all
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.jobs j
    where j.id = documents.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
)
with check (
  auth.uid() = user_id
  and (storage_path is null or storage_path ~ ('^' || auth.uid()::text || '/'))
  and exists (
    select 1 from public.jobs j
    where j.id = documents.job_id
      and j.user_id = auth.uid()
      and j.deleted_at is null
  )
);

-- Jobs linked to a client must reference a client owned by the same user.
drop policy if exists "Users can insert own jobs" on public.jobs;
create policy "Users can insert own jobs"
on public.jobs
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    client_id is null
    or exists (
      select 1 from public.clients c
      where c.id = jobs.client_id
        and c.user_id = auth.uid()
        and c.deleted_at is null
    )
  )
);

drop policy if exists "Users can update own jobs" on public.jobs;
create policy "Users can update own jobs"
on public.jobs
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    client_id is null
    or exists (
      select 1 from public.clients c
      where c.id = jobs.client_id
        and c.user_id = auth.uid()
        and c.deleted_at is null
    )
  )
);

-- Remove duplicate storage policies that were created for public. Authenticated policies remain.
drop policy if exists "Users can delete own storage files" on storage.objects;
drop policy if exists "Users can update own storage files" on storage.objects;
drop policy if exists "Users can upload own storage files" on storage.objects;
drop policy if exists "Users can read own storage files" on storage.objects;

-- Supporting indexes for ownership checks and common production reads.
create index if not exists idx_jobs_user_status_updated on public.jobs (user_id, status, updated_at desc) where deleted_at is null;
create index if not exists idx_jobs_user_created on public.jobs (user_id, created_at desc) where deleted_at is null;
create index if not exists idx_clients_user_updated on public.clients (user_id, updated_at desc) where deleted_at is null;
create index if not exists idx_notifications_user_created on public.notifications (user_id, created_at desc) where deleted_at is null;
create index if not exists idx_job_persons_job_user on public.job_persons (job_id, user_id);
create index if not exists idx_job_expenses_job_user on public.job_expenses (job_id, user_id);
create index if not exists idx_job_reference_photos_job_user on public.job_reference_photos (job_id, user_id);
create index if not exists idx_documents_job_user on public.documents (job_id, user_id);
