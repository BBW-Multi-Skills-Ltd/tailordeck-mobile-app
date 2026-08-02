-- Dashboard aggregation RPCs keep analytics server-side and avoid pulling every job row to the browser.

create or replace function public.get_dashboard_monthly_stats(month_count integer default 6)
returns table (
  month text,
  jobs integer,
  revenue_kobo bigint,
  expenses_kobo bigint,
  profit_kobo bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select greatest(1, least(coalesce(month_count, 6), 24)) as safe_month_count
  ), months as (
    select generate_series(
      date_trunc('month', now()) - ((safe_month_count - 1) || ' months')::interval,
      date_trunc('month', now()),
      interval '1 month'
    )::date as month_start
    from bounds
  ), job_rollup as (
    select
      date_trunc('month', created_at)::date as month_start,
      count(*)::integer as jobs,
      coalesce(sum(charge_amount_kobo), 0)::bigint as revenue_kobo,
      coalesce(sum(total_expenses_kobo), 0)::bigint as expenses_kobo,
      coalesce(sum(coalesce(profit_kobo, charge_amount_kobo - total_expenses_kobo)), 0)::bigint as profit_kobo
    from public.jobs
    where user_id = auth.uid()
      and deleted_at is null
      and status <> 'draft'
      and created_at >= date_trunc('month', now()) - (((select safe_month_count from bounds) - 1) || ' months')::interval
    group by date_trunc('month', created_at)::date
  )
  select
    to_char(months.month_start, 'YYYY-MM') as month,
    coalesce(job_rollup.jobs, 0) as jobs,
    coalesce(job_rollup.revenue_kobo, 0) as revenue_kobo,
    coalesce(job_rollup.expenses_kobo, 0) as expenses_kobo,
    coalesce(job_rollup.profit_kobo, 0) as profit_kobo
  from months
  left join job_rollup using (month_start)
  order by months.month_start;
$$;

create or replace function public.get_dashboard_status_breakdown()
returns table (
  completed integer,
  in_progress integer,
  pending integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where status = 'completed')::integer as completed,
    count(*) filter (where status = 'in_progress')::integer as in_progress,
    count(*) filter (where status = 'pending')::integer as pending
  from public.jobs
  where user_id = auth.uid()
    and deleted_at is null
    and status <> 'draft';
$$;

revoke all on function public.get_dashboard_monthly_stats(integer) from public;
revoke all on function public.get_dashboard_status_breakdown() from public;
grant execute on function public.get_dashboard_monthly_stats(integer) to authenticated;
grant execute on function public.get_dashboard_status_breakdown() to authenticated;
