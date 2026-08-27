create or replace function public.get_job_creation_entitlement()
returns table (
  effective_plan text,
  jobs_used integer,
  job_limit integer,
  can_create_job boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_subscription public.subscriptions%rowtype;
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
  is_paid_active boolean := false;
  used_jobs integer := 0;
  free_job_limit integer := 3;
begin
  if current_user_id is null then
    return query select 'inactive'::text, 0, free_job_limit, false;
    return;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = current_user_id
  limit 1;

  if not found then
    select count(*)::integer
    into used_jobs
    from public.jobs
    where user_id = current_user_id
      and deleted_at is null;

    return query select 'inactive'::text, used_jobs, free_job_limit, false;
    return;
  end if;

  select count(*)::integer
  into used_jobs
  from public.jobs
  where user_id = current_user_id
    and deleted_at is null;

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
  is_trial_active :=
    current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end > now();

  is_paid_active :=
    current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status = 'active'
    and (
      current_subscription.current_period_ends_at is null
      or current_subscription.current_period_ends_at > now()
    );

  if is_trial_active then
    return query select 'trial'::text, used_jobs, null::integer, true;
    return;
  end if;

  if is_paid_active then
    return query select current_subscription.plan_name::text, used_jobs, null::integer, true;
    return;
  end if;

  if current_subscription.plan_name = 'free' and current_subscription.status = 'active' then
    return query select 'free'::text, used_jobs, free_job_limit, used_jobs < free_job_limit;
    return;
  end if;

  return query select 'inactive'::text, used_jobs, free_job_limit, false;
end;
$$;

create or replace function public.enforce_free_plan_job_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid := new.user_id;
  current_subscription public.subscriptions%rowtype;
  trial_end timestamp with time zone;
  is_trial_active boolean := false;
  is_paid_active boolean := false;
  existing_jobs integer := 0;
  free_job_limit integer := 3;
  creates_non_deleted_job boolean := false;
begin
  if target_user_id is null then
    raise exception 'Job owner is required.';
  end if;

  if tg_op = 'INSERT' then
    creates_non_deleted_job := new.deleted_at is null;
  elsif tg_op = 'UPDATE' then
    creates_non_deleted_job := old.deleted_at is not null and new.deleted_at is null;
  end if;

  if not creates_non_deleted_job then
    return new;
  end if;

  select *
  into current_subscription
  from public.subscriptions
  where user_id = target_user_id
  limit 1;

  if not found then
    raise exception 'Active subscription required to create jobs.';
  end if;

  trial_end := coalesce(current_subscription.tester_trial_ends_at, current_subscription.trial_ends_at);
  is_trial_active :=
    current_subscription.plan_name = 'free'
    and current_subscription.status = 'active'
    and trial_end is not null
    and trial_end > now();

  is_paid_active :=
    current_subscription.plan_name in ('starter', 'pro')
    and current_subscription.status = 'active'
    and (
      current_subscription.current_period_ends_at is null
      or current_subscription.current_period_ends_at > now()
    );

  if is_trial_active or is_paid_active then
    return new;
  end if;

  if current_subscription.plan_name = 'free' and current_subscription.status = 'active' then
    select count(*)::integer
    into existing_jobs
    from public.jobs
    where user_id = target_user_id
      and deleted_at is null
      and (tg_op = 'INSERT' or id <> new.id);

    if existing_jobs >= free_job_limit then
      raise exception 'Free plan job limit reached. Upgrade to Starter to create more jobs.';
    end if;

    return new;
  end if;

  raise exception 'Active subscription required to create jobs.';
end;
$$;

drop trigger if exists enforce_free_plan_job_limit on public.jobs;
create trigger enforce_free_plan_job_limit
before insert or update of deleted_at, user_id on public.jobs
for each row
execute function public.enforce_free_plan_job_limit();

revoke all privileges on function public.get_job_creation_entitlement() from public, anon, authenticated;
revoke all privileges on function public.enforce_free_plan_job_limit() from public, anon, authenticated;

grant execute on function public.get_job_creation_entitlement() to authenticated;
