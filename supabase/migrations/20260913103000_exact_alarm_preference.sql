alter table public.user_preferences
  add column if not exists exact_alarm_enabled boolean not null default false;

