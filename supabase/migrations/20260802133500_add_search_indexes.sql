-- Search/filter indexes for common production list screens.

create index if not exists idx_clients_user_lower_name
on public.clients (user_id, lower(name))
where deleted_at is null;

create index if not exists idx_jobs_user_lower_client_name
on public.jobs (user_id, lower(client_name))
where deleted_at is null;

create index if not exists idx_jobs_user_deadline
on public.jobs (user_id, deadline_date, deadline_time)
where deleted_at is null;

create index if not exists idx_documents_user_job_type_created
on public.documents (user_id, job_id, type, created_at desc);
