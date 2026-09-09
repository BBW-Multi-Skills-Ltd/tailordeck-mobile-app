alter table public.jobs
  add column if not exists custom_reminder_value integer,
  add column if not exists custom_reminder_unit text,
  add column if not exists custom_reminder_minutes integer,
  add column if not exists reminder_label text;

update public.jobs
set reminder_label = case
  when reminder = 'none' then 'No reminder'
  else reminder
end
where reminder_label is null;

alter table public.jobs
  drop constraint if exists jobs_reminder_check,
  drop constraint if exists jobs_custom_reminder_unit_check,
  drop constraint if exists jobs_custom_reminder_range_check,
  drop constraint if exists jobs_custom_reminder_required_check;

alter table public.jobs
  add constraint jobs_reminder_check
    check (reminder = any (array['1 day before'::text, '3 days before'::text, '1 week before'::text, 'custom'::text, 'none'::text])) not valid,
  add constraint jobs_custom_reminder_unit_check
    check (custom_reminder_unit is null or custom_reminder_unit = any (array['minutes'::text, 'hours'::text, 'days'::text, 'weeks'::text])) not valid,
  add constraint jobs_custom_reminder_range_check
    check (custom_reminder_minutes is null or custom_reminder_minutes between 10 and 43200) not valid,
  add constraint jobs_custom_reminder_required_check
    check (
      reminder <> 'custom'
      or (
        custom_reminder_value is not null
        and custom_reminder_value > 0
        and custom_reminder_unit is not null
        and custom_reminder_minutes is not null
        and reminder_label is not null
        and btrim(reminder_label) <> ''
      )
    ) not valid;

alter table public.jobs validate constraint jobs_reminder_check;
alter table public.jobs validate constraint jobs_custom_reminder_unit_check;
alter table public.jobs validate constraint jobs_custom_reminder_range_check;
alter table public.jobs validate constraint jobs_custom_reminder_required_check;

create or replace function public.compute_job_reminder_time(job_row public.jobs)
returns timestamp with time zone
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
  due_at timestamp with time zone;
begin
  if job_row.deadline_date is null or job_row.reminder = 'none' then
    return null;
  end if;

  due_at := (job_row.deadline_date::timestamp + coalesce(job_row.deadline_time, time '09:00'))::timestamp with time zone;

  return case job_row.reminder
    when '1 day before' then greatest(due_at - interval '1 day', now())
    when '3 days before' then greatest(due_at - interval '3 days', now())
    when '1 week before' then greatest(due_at - interval '1 week', now())
    when 'custom' then
      case
        when job_row.custom_reminder_minutes is null then null
        else greatest(due_at - make_interval(mins => job_row.custom_reminder_minutes), now())
      end
    else null
  end;
end;
$$;

drop trigger if exists notify_jobs_after_update on public.jobs;
create trigger notify_jobs_after_update
after update of deadline_date, deadline_time, reminder, custom_reminder_value, custom_reminder_unit, custom_reminder_minutes, reminder_label, status, deleted_at on public.jobs
for each row execute function public.notify_job_after_update();

revoke all privileges on function public.compute_job_reminder_time(public.jobs) from public, anon, authenticated;
