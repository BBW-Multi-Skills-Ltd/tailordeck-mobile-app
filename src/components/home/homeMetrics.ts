import { RiScissorsLine } from 'react-icons/ri'
import { TbMoneybag } from 'react-icons/tb'
import { appJobs } from '../../data/appData'
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

export function getRecentJobs(): RecentJob[] {
  return [...appJobs]
    .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1))
    .slice(0, 3)
    .map((job) => ({
      id: job.id,
      clientName: job.clientName,
      title: job.title,
      deadlineDate: job.deadlineDate,
      status: job.status,
    }))
}

export function getHomeKpiCards() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthJobs = appJobs.filter((job) => job.createdDate.slice(0, 7) === currentMonth)
  const totalExpenses = monthJobs.reduce((sum, job) => sum + calculateExpenseEstimate(job.chargeAmount, job.status), 0)

  return [
    { label: 'Jobs This Month', value: String(monthJobs.length), icon: RiScissorsLine },
    { label: 'Total Expenses', value: `₦${Math.round(totalExpenses / 1000)}k`, icon: TbMoneybag },
  ]
}

export function formatHomeProfit(): string {
  const profit = appJobs.reduce((sum, job) => sum + (job.chargeAmount - calculateExpenseEstimate(job.chargeAmount, job.status)), 0)
  return `₦${profit.toLocaleString('en-NG')}`
}

export function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

function calculateExpenseEstimate(chargeAmount: number, status: JobStatus): number {
  const ratio = status === 'Completed' ? 0.36 : status === 'In Progress' ? 0.32 : 0.28
  return Math.round(chargeAmount * ratio)
}
