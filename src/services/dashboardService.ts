import { supabase } from '../lib/supabase'
import type { JobRow } from './types'
import { requireUserId } from './serviceHelpers'
import { mapJobRow } from './mappers/jobMapper'

export interface MonthlyStat {
  month: string
  jobs: number
  revenueKobo: number
  expensesKobo: number
  profitKobo: number
}

export interface JobStatusBreakdown {
  completed: number
  inProgress: number
  pending: number
}

export interface HomeSummary {
  month: string
  jobs: number
  revenueKobo: number
  expensesKobo: number
  profitKobo: number
}

interface MonthlyStatsRpcRow {
  month: string
  jobs: number
  revenue_kobo: number
  expenses_kobo: number
  profit_kobo: number
}

interface StatusBreakdownRpcRow {
  completed: number
  in_progress: number
  pending: number
}

interface HomeSummaryRpcRow {
  month: string
  jobs: number
  revenue_kobo: number
  expenses_kobo: number
  profit_kobo: number
}

export async function getRecentJobs(limit = 5) {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(limit)
    .returns<JobRow[]>()
  if (error) throw error
  return (data ?? []).map(mapJobRow)
}

export async function getHomeCurrentMonthSummary(): Promise<HomeSummary> {
  await requireUserId()
  const { data, error } = await supabase.rpc('get_home_current_month_summary').maybeSingle<HomeSummaryRpcRow>()
  if (error) throw error
  const fallbackMonth = new Date().toISOString().slice(0, 7)
  return {
    month: data?.month ?? fallbackMonth,
    jobs: data?.jobs ?? 0,
    revenueKobo: data?.revenue_kobo ?? 0,
    expensesKobo: data?.expenses_kobo ?? 0,
    profitKobo: data?.profit_kobo ?? 0,
  }
}

export async function getMonthlyStats(monthCount = 6): Promise<MonthlyStat[]> {
  await requireUserId()
  const { data, error } = await supabase.rpc('get_dashboard_monthly_stats', { month_count: monthCount }).returns<MonthlyStatsRpcRow[]>()
  if (error) throw error
  const rows = (data ?? []) as MonthlyStatsRpcRow[]
  return rows.map((row) => ({
    month: row.month,
    jobs: row.jobs,
    revenueKobo: row.revenue_kobo,
    expensesKobo: row.expenses_kobo,
    profitKobo: row.profit_kobo,
  }))
}

export async function getJobStatusBreakdown(monthKey?: string): Promise<JobStatusBreakdown> {
  await requireUserId()
  const { data, error } = await supabase
    .rpc('get_dashboard_status_breakdown', { month_key: monthKey ?? null })
    .maybeSingle<StatusBreakdownRpcRow>()
  if (error) throw error
  return {
    completed: data?.completed ?? 0,
    inProgress: data?.in_progress ?? 0,
    pending: data?.pending ?? 0,
  }
}
