import type { DetailedJobData } from '../../data/mockJobDetails'
import { toNaira } from '../../lib/money'
import type { JobWithRelations } from '../../services/types'
import type { MockJob, JobStatus } from '../../types/job'
import { mapJobRow } from '../../services/mappers/jobMapper'

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

export function getJobDetailsFromRow(job: JobWithRelations): DetailedJobData {
  return {
    itemType: job.item_type || job.title || 'Tailoring job',
    orderMode: job.order_mode,
    jobType: job.make_category,
    orderScope: job.order_scope,
    measurement: getMeasurementText(job),
    materialType: job.material_type || '-',
    color: job.material_color || '-',
    totalYard: job.material_yards ? String(job.material_yards) : '-',
    materialQuality: job.material_quality || '-',
    materialSource: job.material_source === 'Client is Providing Material' ? 'Client Provided' : job.material_source || '-',
    deliveryTime: job.deadline_time || '-',
    reminder: job.reminder || '-',
    referencePhotos: getReferencePhotos(job),
    expenses: (job.job_expenses ?? []).map((expense) => ({
      name: expense.name,
      cost: toNaira(expense.cost_amount_kobo),
    })),
    depositAmount: toNaira(job.deposit_amount_kobo),
  }
}

export function getMockJobFromRow(job: JobWithRelations): MockJob {
  return mapJobRow(job)
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

function getMeasurementText(job: JobWithRelations): string {
  const count = job.job_persons?.length ?? 0
  if (job.make_category === 'Non-Body Item') return count ? 'Non-body item captured' : 'No item dimensions captured'
  if (count === 1) return '1 person profile captured'
  if (count > 1) return `${count} person profiles captured`
  return `${job.order_scope} measurements captured`
}

function getReferencePhotos(job: JobWithRelations): string[] {
  const photos = (job.job_reference_photos ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((photo) => photo.storage_path)

  return photos.length ? photos : []
}
