import type { DetailedJobData } from '../../data/mockJobDetails'
import type { MockJob, JobStatus } from '../../types/job'

export function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export function formatDateNumeric(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB')
}

export function formatDateWords(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTimeWords(value: string): string {
  if (!value) return '-'
  const [hourRaw, minuteRaw] = value.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value

  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
}

export function getDefaultJobDetails(job?: MockJob): DetailedJobData {
  if (!job) {
    return {
      jobType: 'Body Wear',
      orderMode: 'New Stitch',
      itemType: '-',
      orderScope: '-',
      measurement: '-',
      materialType: '-',
      color: '-',
      totalYard: '-',
      materialQuality: '-',
      materialSource: '-',
      deliveryTime: '-',
      reminder: '-',
      referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
      expenses: [],
      depositAmount: 0,
    }
  }

  return {
    itemType: job.title,
    orderMode: 'New Stitch',
    jobType: 'Body Wear',
    orderScope: job.jobType,
    measurement: `${job.jobType} measurements captured`,
    materialType: 'Ankara',
    color: 'Mixed',
    totalYard: '0',
    materialQuality: 'Normal',
    materialSource: 'Client Provided',
    deliveryTime: '12:00',
    reminder: '1 day before',
    referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
    expenses: [],
    depositAmount: 0,
  }
}

export function getMeasurementScopeText(params: {
  details: DetailedJobData
  measurementOrderScope?: string
  fallbackScope: string
}): string {
  const { details, measurementOrderScope, fallbackScope } = params
  return details.jobType === 'Non-Body Item'
    ? 'Non-body item captured'
    : measurementOrderScope ?? fallbackScope
}
