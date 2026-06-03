import type { MockJob } from '../../types/job'

export type MonthStat = {
  key: string
  label: string
  fullLabel: string
  jobs: number
  revenue: number
  expenses: number
  profit: number
}

export type DashboardMetrics = {
  bestMonth: MonthStat | null
  latestDate: Date
  months: MonthStat[]
  statusCounts: {
    completed: number
    inProgress: number
    pending: number
  }
  totalExpenses: number
  totalJobs: number
  totalProfit: number
  totalRevenue: number
}

export function monthKey(date: string): string {
  const parsed = new Date(date)
  const year = parsed.getFullYear()
  const month = parsed.getMonth() + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

export function monthLabel(key: string, format: 'short' | 'long' = 'short'): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-NG', { month: format })
}

export function estimateJobExpense(job: MockJob): number {
  const expenseRatio = job.status === 'Completed' ? 0.36 : job.status === 'In Progress' ? 0.32 : 0.28
  return Math.round(job.chargeAmount * expenseRatio)
}

export function buildDashboardMetrics(jobs: MockJob[]): DashboardMetrics {
  const sortedJobs = [...jobs].sort((a, b) => (a.createdDate > b.createdDate ? 1 : -1))
  const latestDate = sortedJobs.length ? new Date(sortedJobs[sortedJobs.length - 1].createdDate) : new Date()
  const monthKeys = getRecentMonthKeys(latestDate, 6)
  const monthSet = new Set(monthKeys)
  const monthMap = new Map<string, MonthStat>(monthKeys.map((key) => [key, createMonthStat(key)]))

  for (const job of jobs) {
    const key = monthKey(job.createdDate)
    const existing = monthSet.has(key) ? monthMap.get(key) : undefined
    if (!existing) continue

    const expenseEstimate = estimateJobExpense(job)
    existing.jobs += 1
    existing.revenue += job.chargeAmount
    existing.expenses += expenseEstimate
    existing.profit += job.chargeAmount - expenseEstimate
  }

  const months = monthKeys.map((key) => monthMap.get(key)!)
  const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0)
  const totalExpenses = months.reduce((sum, month) => sum + month.expenses, 0)
  const currentMonthJobs = jobs.filter((job) => monthKey(job.createdDate) === monthKeys[monthKeys.length - 1])

  return {
    bestMonth: months.reduce<MonthStat | null>((best, month) => (!best || month.profit > best.profit ? month : best), null),
    latestDate,
    months,
    statusCounts: {
      completed: currentMonthJobs.filter((job) => job.status === 'Completed').length,
      inProgress: currentMonthJobs.filter((job) => job.status === 'In Progress').length,
      pending: currentMonthJobs.filter((job) => job.status === 'Pending').length,
    },
    totalExpenses,
    totalJobs: currentMonthJobs.length,
    totalProfit: totalRevenue - totalExpenses,
    totalRevenue,
  }
}

function createMonthStat(key: string): MonthStat {
  return {
    key,
    label: monthLabel(key),
    fullLabel: monthLabel(key, 'long'),
    jobs: 0,
    revenue: 0,
    expenses: 0,
    profit: 0,
  }
}

function getRecentMonthKeys(latestDate: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index
    const date = new Date(latestDate.getFullYear(), latestDate.getMonth() - offset, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })
}
