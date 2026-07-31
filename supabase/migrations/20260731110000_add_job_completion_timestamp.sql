alter table public.jobs
  add column if not exists completed_at timestamp with time zone;

update public.jobs
set completed_at = coalesce(completed_at, updated_at, now())
where status = 'completed';

alter table public.jobs
  drop constraint if exists jobs_completed_at_status_check;

alter table public.jobs
  add constraint jobs_completed_at_status_check
  check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed')
  ) not valid;

alter table public.jobs validate constraint jobs_completed_at_status_check;
