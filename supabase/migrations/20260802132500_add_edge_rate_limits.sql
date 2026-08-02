-- Lightweight server-side rate limiting for Edge Functions.
-- Edge Functions use the service role to update this table; browser roles have no access.

create table if not exists public.edge_rate_limits (
  action text not null,
  actor_id text not null,
  window_start timestamp with time zone not null default now(),
  request_count integer not null default 1,
  updated_at timestamp with time zone not null default now(),
  primary key (action, actor_id)
);

alter table public.edge_rate_limits enable row level security;

revoke all on table public.edge_rate_limits from anon;
revoke all on table public.edge_rate_limits from authenticated;

create index if not exists idx_edge_rate_limits_window_start
on public.edge_rate_limits (window_start);
