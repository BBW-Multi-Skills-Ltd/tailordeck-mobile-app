alter table public.job_reference_photos
  add column if not exists target_id text,
  add column if not exists target_label text,
  add column if not exists updated_at timestamp with time zone not null default now();

drop trigger if exists update_job_reference_photos_updated_at on public.job_reference_photos;

create trigger update_job_reference_photos_updated_at
before update on public.job_reference_photos
for each row execute function public.update_updated_at();
