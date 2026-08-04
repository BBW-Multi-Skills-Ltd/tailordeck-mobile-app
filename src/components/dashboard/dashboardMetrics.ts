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
  firstDate: Date
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
  selectedMonthKey?: string,
): DashboardMetrics {
  const activeStats = stats.filter((stat) => stat.jobs > 0)
  const latestDate = getLatestDate(activeStats)
  const firstDate = getFirstDate(activeStats, latestDate)
  const monthKeys = getMonthKeysBetween(firstDate, latestDate).slice(-6)
  const statsByMonth = new Map(stats.map((stat) => [stat.month, stat]))
  const months = monthKeys.map((key) => mapMonthStat(key, statsByMonth.get(key)))
  const selectedMonth = months.find((month) => month.key === selectedMonthKey) ?? months[months.length - 1] ?? mapMonthStat(formatMonthKey(latestDate))

  return {
    bestMonth: months.reduce<MonthStat | null>((best, month) => (month.jobs > 0 && (!best || month.profit > best.profit) ? month : best), null),
    firstDate,
    latestDate,
    months,
    statusCounts,
    totalExpenses: selectedMonth.expenses,
    totalJobs: selectedMonth.jobs,
    totalProfit: selectedMonth.profit,
    totalRevenue: selectedMonth.revenue,
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

function getFirstDate(stats: ServiceMonthlyStat[], fallback: Date): Date {
  const firstMonth = [...stats].sort((a, b) => a.month.localeCompare(b.month)).at(0)?.month
  if (!firstMonth) return fallback
  const [year, month] = firstMonth.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

function getMonthKeysBetween(firstDate: Date, latestDate: Date): string[] {
  const keys: string[] = []
  const cursor = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  const end = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1)

  while (cursor <= end) {
    keys.push(formatMonthKey(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return keys.length ? keys : [formatMonthKey(latestDate)]
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
