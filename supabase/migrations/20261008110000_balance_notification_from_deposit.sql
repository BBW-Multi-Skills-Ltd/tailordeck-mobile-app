-- "Balance to collect" notification: computed from charge - deposit. It used jobs.balance_amount_kobo, which
-- nothing ever wrote, so the notification never fired. Also fires when a draft is finalised (an UPDATE),
-- not only when a job is saved straight as pending (an INSERT). The unused column is then dropped.

create or replace function public.notify_job_balance(job_row public.jobs)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  job_label text := coalesce(nullif(btrim(job_row.title), ''), nullif(btrim(job_row.item_type), ''), 'job');
begin
  if job_row.deleted_at is null
    and job_row.status not in ('draft', 'completed', 'cancelled')
    and coalesce(job_row.charge_amount_kobo, 0) - coalesce(job_row.deposit_amount_kobo, 0) > 0 then
    perform public.insert_notification_once(
      job_row.user_id,
      'balance',
      'Balance to collect',
      job_row.client_name || ' still has a balance on ' || job_label || '.',
      '/jobs/' || job_row.id::text,
      job_row.id,
      null,
      interval '10 minutes'
    );
  end if;
end;
$function$;

revoke all on function public.notify_job_balance(public.jobs) from public, anon, authenticated;

create or replace function public.notify_job_after_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  job_label text := coalesce(nullif(btrim(new.title), ''), nullif(btrim(new.item_type), ''), 'job');
begin
  if new.deleted_at is not null then
    return new;
  end if;

  if new.status <> 'draft' then
    perform public.insert_notification_once(
      new.user_id,
      'general',
      'Job created',
      job_label || ' for ' || new.client_name || ' is now pending.',
      '/jobs/' || new.id::text,
      new.id,
      null,
      interval '10 minutes'
    );
    perform public.notify_job_balance(new);
  end if;

  perform public.refresh_job_deadline_notification(new);
  return new;
end;
$function$;

create or replace function public.notify_job_after_update()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  job_label text := coalesce(nullif(btrim(new.title), ''), nullif(btrim(new.item_type), ''), 'job');
begin
  if old.status is distinct from new.status and new.status = 'completed' and new.deleted_at is null then
    perform public.insert_notification_once(
      new.user_id,
      'general',
      'Job completed',
      job_label || ' for ' || new.client_name || ' has been marked completed.',
      '/jobs/' || new.id::text,
      new.id,
      null,
      interval '10 minutes'
    );
  end if;

  -- A finalised draft is new work with money still owed.
  if old.status = 'draft' and new.status <> 'draft' then
    perform public.notify_job_balance(new);
  end if;

  if old.deadline_date is distinct from new.deadline_date
    or old.deadline_time is distinct from new.deadline_time
    or old.reminder is distinct from new.reminder
    or old.status is distinct from new.status
    or old.deleted_at is distinct from new.deleted_at then
    perform public.refresh_job_deadline_notification(new);
  end if;

  return new;
end;
$function$;

alter table public.jobs drop column if exists balance_amount_kobo;
