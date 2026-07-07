import { toNaira } from '../../lib/money'
import type { JobStatusBreakdown, MonthlyStat as ServiceMonthlyStat } from '../../services/dashboardService'

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

export function monthLabel(key: string, format: 'short' | 'long' = 'short'): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-NG', { month: format })
}

export function buildDashboardMetricsFromStats(
  stats: ServiceMonthlyStat[] = [],
  statusCounts: JobStatusBreakdown = { completed: 0, inProgress: 0, pending: 0 },
): DashboardMetrics {
  const latestDate = getLatestDate(stats)
  const monthKeys = getRecentMonthKeys(latestDate, 6)
  const statsByMonth = new Map(stats.map((stat) => [stat.month, stat]))
  const months = monthKeys.map((key) => mapMonthStat(key, statsByMonth.get(key)))
  const currentMonth = months[months.length - 1]

  return {
    bestMonth: months.reduce<MonthStat | null>((best, month) => (!best || month.profit > best.profit ? month : best), null),
    latestDate,
    months,
    statusCounts,
    totalExpenses: currentMonth.expenses,
    totalJobs: currentMonth.jobs,
    totalProfit: currentMonth.profit,
    totalRevenue: currentMonth.revenue,
  }
}

function mapMonthStat(key: string, stat?: ServiceMonthlyStat): MonthStat {
  return {
    key,
    label: monthLabel(key),
    fullLabel: monthLabel(key, 'long'),
    jobs: stat?.jobs ?? 0,
    revenue: toNaira(stat?.revenueKobo ?? 0),
    expenses: toNaira(stat?.expensesKobo ?? 0),
    profit: toNaira(stat?.profitKobo ?? 0),
  }
}

function getLatestDate(stats: ServiceMonthlyStat[]): Date {
  const latestMonth = [...stats].sort((a, b) => a.month.localeCompare(b.month)).at(-1)?.month
  if (!latestMonth) return new Date()
  const [year, month] = latestMonth.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

function getRecentMonthKeys(latestDate: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index
    const date = new Date(latestDate.getFullYear(), latestDate.getMonth() - offset, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })
}
