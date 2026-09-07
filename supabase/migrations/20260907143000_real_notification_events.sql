set check_function_bodies = off;

create or replace function public.insert_notification_once(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_action_url text default null,
  notification_job_id uuid default null,
  notification_scheduled_for timestamp with time zone default null,
  dedupe_window interval default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  safe_type text := case
    when notification_type in ('deadline', 'balance', 'invoice', 'account', 'general') then notification_type
    else 'general'
  end;
begin
  if target_user_id is null or nullif(btrim(notification_title), '') is null then
    return;
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    job_id,
    scheduled_for,
    created_at
  )
  select
    target_user_id,
    safe_type,
    btrim(notification_title),
    coalesce(nullif(btrim(notification_message), ''), btrim(notification_title)),
    notification_action_url,
    notification_job_id,
    notification_scheduled_for,
    now()
  where not exists (
    select 1
    from public.notifications n
    where n.user_id = target_user_id
      and n.type = safe_type
      and n.title = btrim(notification_title)
      and coalesce(n.action_url, '') = coalesce(notification_action_url, '')
      and n.job_id is not distinct from notification_job_id
      and n.deleted_at is null
      and (
        dedupe_window is null
        or n.created_at >= now() - dedupe_window
      )
  );
end;
$$;

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
    else null
  end;
end;
$$;

create or replace function public.refresh_job_deadline_notification(job_row public.jobs)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  job_label text := coalesce(nullif(btrim(job_row.title), ''), nullif(btrim(job_row.item_type), ''), 'job');
  reminder_at timestamp with time zone := public.compute_job_reminder_time(job_row);
  due_label text := case
    when job_row.deadline_date is null then null
    when job_row.deadline_time is null then to_char(job_row.deadline_date, 'Mon DD, YYYY')
    else to_char(job_row.deadline_date, 'Mon DD, YYYY') || ' at ' || to_char(job_row.deadline_time, 'HH12:MI AM')
  end;
begin
  update public.notifications
  set deleted_at = now()
  where user_id = job_row.user_id
    and job_id = job_row.id
    and type = 'deadline'
    and title in ('Deadline reminder set', 'Deadline updated')
    and deleted_at is null;

  if job_row.deleted_at is not null
    or job_row.status in ('draft', 'completed', 'cancelled')
    or job_row.deadline_date is null
    or job_row.reminder = 'none'
    or reminder_at is null then
    return;
  end if;

  perform public.insert_notification_once(
    job_row.user_id,
    'deadline',
    'Deadline reminder set',
    'We will remind you about ' || job_label || ' for ' || job_row.client_name || ' on ' || due_label || '.',
    '/jobs/' || job_row.id::text,
    job_row.id,
    reminder_at,
    interval '5 minutes'
  );
end;
$$;

create or replace function public.notify_job_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

    if coalesce(new.balance_amount_kobo, 0) > 0 then
      perform public.insert_notification_once(
        new.user_id,
        'balance',
        'Balance to collect',
        new.client_name || ' still has a balance on ' || job_label || '.',
        '/jobs/' || new.id::text,
        new.id,
        null,
        interval '10 minutes'
      );
    end if;
  end if;

  perform public.refresh_job_deadline_notification(new);
  return new;
end;
$$;

create or replace function public.notify_job_after_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

  if old.deadline_date is distinct from new.deadline_date
    or old.deadline_time is distinct from new.deadline_time
    or old.reminder is distinct from new.reminder
    or old.status is distinct from new.status
    or old.deleted_at is distinct from new.deleted_at then
    perform public.refresh_job_deadline_notification(new);
  end if;

  return new;
end;
$$;

drop trigger if exists notify_jobs_after_insert on public.jobs;
create trigger notify_jobs_after_insert
after insert on public.jobs
for each row
execute function public.notify_job_after_insert();

drop trigger if exists notify_jobs_after_update on public.jobs;
create trigger notify_jobs_after_update
after update of deadline_date, deadline_time, reminder, status, deleted_at on public.jobs
for each row
execute function public.notify_job_after_update();

create or replace function public.notify_document_sent()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  document_label text := initcap(new.type);
begin
  if new.sent_at is null and new.shared_at is null then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.sent_at is not distinct from new.sent_at
    and old.shared_at is not distinct from new.shared_at then
    return new;
  end if;

  perform public.insert_notification_once(
    new.user_id,
    'invoice',
    document_label || ' sent',
    document_label || ' PDF has been shared with the client.',
    '/jobs/' || new.job_id::text,
    new.job_id,
    null,
    interval '10 minutes'
  );

  return new;
end;
$$;

drop trigger if exists notify_documents_after_send on public.documents;
create trigger notify_documents_after_send
after insert or update of sent_at, shared_at on public.documents
for each row
execute function public.notify_document_sent();

create or replace function public.notify_subscription_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  trial_end timestamp with time zone := coalesce(new.tester_trial_ends_at, new.trial_ends_at);
  plan_label text := initcap(new.plan_name);
begin
  if tg_op = 'INSERT'
    and new.plan_name = 'free'
    and new.status = 'active'
    and trial_end is not null
    and trial_end > now() then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      'Free trial started',
      'Your 14-day full access trial is active.',
      '/settings/subscription',
      null,
      null,
      null
    );
    return new;
  end if;

  if tg_op = 'UPDATE'
    and new.plan_name = 'free'
    and new.status = 'active'
    and trial_end is not null
    and trial_end > now()
    and (
      old.trial_ends_at is distinct from new.trial_ends_at
      or old.tester_trial_ends_at is distinct from new.tester_trial_ends_at
    ) then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      'Free trial started',
      'Your 14-day full access trial is active.',
      '/settings/subscription',
      null,
      null,
      null
    );
  end if;

  if tg_op = 'UPDATE'
    and old.plan_name is distinct from new.plan_name
    and new.plan_name in ('starter', 'pro')
    and new.status in ('active', 'cancelled') then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      plan_label || ' plan active',
      'Your TailorDeck ' || plan_label || ' plan is now active.',
      '/settings/subscription',
      null,
      null,
      interval '10 minutes'
    );
  end if;

  if tg_op = 'UPDATE'
    and old.plan_name in ('starter', 'pro')
    and new.plan_name = 'free' then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      'You are now on Free',
      'Your paid plan ended. Your data is safe, and Free plan limits now apply.',
      '/settings/subscription',
      null,
      null,
      interval '10 minutes'
    );
  end if;

  if tg_op = 'UPDATE'
    and old.cancel_at_period_end = false
    and new.cancel_at_period_end = true then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      'Cancellation scheduled',
      'Your paid access remains active until the billing period ends.',
      '/settings/manage-plan',
      null,
      null,
      interval '10 minutes'
    );
  end if;

  if tg_op = 'UPDATE'
    and old.cancel_at_period_end = true
    and new.cancel_at_period_end = false then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      'Plan kept active',
      'Your subscription cancellation has been removed.',
      '/settings/manage-plan',
      null,
      null,
      interval '10 minutes'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_subscriptions_after_change on public.subscriptions;
create trigger notify_subscriptions_after_change
after insert or update of plan_name, status, trial_ends_at, tester_trial_ends_at, cancel_at_period_end, current_period_ends_at
on public.subscriptions
for each row
execute function public.notify_subscription_change();

create or replace function public.notify_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.onboarding_complete is distinct from new.onboarding_complete
    and new.onboarding_complete = true then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      'Welcome to TailorDeck',
      'Your workspace is ready. Create your first job when you are ready.',
      '/',
      null,
      null,
      null
    );
  end if;

  if old.account_status is distinct from new.account_status then
    if new.account_status = 'deactivated' then
      perform public.insert_notification_once(
        new.user_id,
        'account',
        'Account deactivated',
        'Your account has been deactivated. You can restore it before using TailorDeck again.',
        '/settings/security',
        null,
        null,
        interval '10 minutes'
      );
    elsif new.account_status = 'pending_deletion' then
      perform public.insert_notification_once(
        new.user_id,
        'account',
        'Account deletion requested',
        'Your account is scheduled for deletion after the recovery period.',
        '/settings/security',
        null,
        null,
        interval '10 minutes'
      );
    elsif new.account_status = 'active' and old.account_status in ('deactivated', 'pending_deletion') then
      perform public.insert_notification_once(
        new.user_id,
        'account',
        'Account restored',
        'Your TailorDeck account is active again.',
        '/',
        null,
        null,
        interval '10 minutes'
      );
    end if;
  end if;

  if old.email is distinct from new.email
    and nullif(btrim(coalesce(new.email, '')), '') is not null then
    perform public.insert_notification_once(
      new.user_id,
      'account',
      'Login email updated',
      'Your TailorDeck login email was changed.',
      '/settings/security',
      null,
      null,
      interval '10 minutes'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_profiles_after_change on public.profiles;
create trigger notify_profiles_after_change
after update of onboarding_complete, account_status, email on public.profiles
for each row
execute function public.notify_profile_change();

create or replace function public.create_account_security_notification(event_key text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if event_key = 'password_updated' then
    perform public.insert_notification_once(
      current_user_id,
      'account',
      'Password updated',
      'Your TailorDeck login password was changed.',
      '/settings/security',
      null,
      null,
      interval '10 minutes'
    );
  elsif event_key = 'email_updated' then
    perform public.insert_notification_once(
      current_user_id,
      'account',
      'Login email updated',
      'Your TailorDeck login email was changed.',
      '/settings/security',
      null,
      null,
      interval '10 minutes'
    );
  else
    raise exception 'Unsupported notification event.';
  end if;
end;
$$;

revoke all privileges on function public.insert_notification_once(uuid, text, text, text, text, uuid, timestamp with time zone, interval) from public, anon, authenticated;
revoke all privileges on function public.compute_job_reminder_time(public.jobs) from public, anon, authenticated;
revoke all privileges on function public.refresh_job_deadline_notification(public.jobs) from public, anon, authenticated;
revoke all privileges on function public.notify_job_after_insert() from public, anon, authenticated;
revoke all privileges on function public.notify_job_after_update() from public, anon, authenticated;
revoke all privileges on function public.notify_document_sent() from public, anon, authenticated;
revoke all privileges on function public.notify_subscription_change() from public, anon, authenticated;
revoke all privileges on function public.notify_profile_change() from public, anon, authenticated;
revoke all privileges on function public.create_account_security_notification(text) from public, anon, authenticated;

grant execute on function public.create_account_security_notification(text) to authenticated;
