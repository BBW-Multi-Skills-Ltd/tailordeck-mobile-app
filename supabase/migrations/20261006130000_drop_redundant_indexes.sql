-- Drop indexes that are fully covered by another index with the same leading columns (and same or wider
-- WHERE clause). Reads use the covering index; writes no longer maintain the duplicate.

-- covered by idx_jobs_status_active / idx_jobs_user_created / ... (user_id, ...) where deleted_at is null
drop index if exists public.idx_jobs_user_id_active;
-- covered by idx_jobs_user_deadline (user_id, deadline_date, deadline_time) where deleted_at is null
drop index if exists public.idx_jobs_deadline_active;
-- duplicate of idx_jobs_user_created (user_id, created_at desc); every app query filters deleted_at is null
drop index if exists public.idx_jobs_created_at;

-- covered by the (job_id, user_id) indexes
drop index if exists public.idx_job_persons_job;
drop index if exists public.idx_job_expenses_job;
drop index if exists public.idx_job_reference_photos_job;
drop index if exists public.idx_documents_job;

-- covered by idx_clients_user_updated / idx_clients_name_active (user_id, ...) where deleted_at is null
drop index if exists public.idx_clients_user_id_active;
