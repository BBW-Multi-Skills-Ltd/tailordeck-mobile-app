alter table public.documents
  add column if not exists updated_at timestamp with time zone not null default now();

drop trigger if exists update_documents_updated_at on public.documents;
create trigger update_documents_updated_at
before update on public.documents
for each row execute function public.update_updated_at();
