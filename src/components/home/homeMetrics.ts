import { RiScissorsLine } from 'react-icons/ri'
import { TbMoneybag } from 'react-icons/tb'
import { formatNaira } from '../../lib/money'
import type { MonthlyStat } from '../../services/dashboardService'
import type { JobStatus } from '../../types/job'

export type RecentJob = {
  id: string
  clientName: string
  title: string
  deadlineDate: string
  status: JobStatus
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getCurrentMonthStats(monthlyStats: MonthlyStat[] = []): MonthlyStat | undefined {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return monthlyStats.find((stat) => stat.month === currentMonth)
}

export function getHomeKpiCards(currentMonth?: MonthlyStat) {
  return [
    { label: 'Jobs This Month', value: String(currentMonth?.jobs ?? 0), icon: RiScissorsLine },
    { label: 'Total Expenses', value: formatCompactNaira(currentMonth?.expensesKobo ?? 0), icon: TbMoneybag },
  ]
}

export function formatHomeProfit(currentMonth?: MonthlyStat): string {
  return formatNaira(currentMonth?.profitKobo ?? 0)
}

export function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

function formatCompactNaira(kobo: number): string {
  const naira = Math.round(kobo / 100)
  if (naira >= 1000000) return `₦${Math.round(naira / 100000) / 10}m`
  if (naira >= 100000) return `₦${Math.round(naira / 1000)}k`
  return formatNaira(kobo)
}
