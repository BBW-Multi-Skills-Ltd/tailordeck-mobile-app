import { supabase } from '../lib/supabase'
import { mapJobRow } from './mappers/jobMapper'
import type { JobRow } from './types'
import { requireUserId } from './serviceHelpers'

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

export async function getMonthlyStats(): Promise<MonthlyStat[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('jobs').select('*').eq('user_id', userId).is('deleted_at', null).returns<JobRow[]>()
  if (error) throw error
  const grouped = new Map<string, MonthlyStat>()
  for (const job of data ?? []) {
    const month = (job.created_at || '').slice(0, 7)
    if (!month) continue
    const existing = grouped.get(month) ?? { month, jobs: 0, revenueKobo: 0, expensesKobo: 0, profitKobo: 0 }
    existing.jobs += 1
    existing.revenueKobo += job.charge_amount_kobo ?? 0
    existing.expensesKobo += job.total_expenses_kobo ?? 0
    existing.profitKobo += job.profit_kobo ?? (job.charge_amount_kobo ?? 0) - (job.total_expenses_kobo ?? 0)
    grouped.set(month, existing)
  }
  return [...grouped.values()].sort((a, b) => a.month.localeCompare(b.month))
}

export async function getJobStatusBreakdown(): Promise<JobStatusBreakdown> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('jobs').select('status').eq('user_id', userId).is('deleted_at', null).returns<Array<Pick<JobRow, 'status'>>>()
  if (error) throw error
  return (data ?? []).reduce<JobStatusBreakdown>(
    (counts, job) => {
      if (job.status === 'completed') counts.completed += 1
      else if (job.status === 'in_progress') counts.inProgress += 1
      else if (job.status === 'pending') counts.pending += 1
      return counts
    },
    { completed: 0, inProgress: 0, pending: 0 },
  )
}
