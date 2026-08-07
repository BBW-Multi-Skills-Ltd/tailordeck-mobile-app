-- Make dashboard status breakdown follow the selected month instead of all-time totals.

create or replace function public.get_dashboard_status_breakdown(month_key text default null)
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
  with parsed_month as (
    select
      case
        when month_key ~ '^\d{4}-\d{2}$' then to_date(month_key || '-01', 'YYYY-MM-DD')
        else null
      end as month_start
  )
  select
    count(*) filter (where status = 'completed')::integer as completed,
    count(*) filter (where status = 'in_progress')::integer as in_progress,
    count(*) filter (where status = 'pending')::integer as pending
  from public.jobs, parsed_month
  where user_id = auth.uid()
    and deleted_at is null
    and status <> 'draft'
    and (
      parsed_month.month_start is null
      or (
        created_at >= parsed_month.month_start
        and created_at < (parsed_month.month_start + interval '1 month')
      )
    );
$$;

revoke all on function public.get_dashboard_status_breakdown(text) from public;
grant execute on function public.get_dashboard_status_breakdown(text) to authenticated;
