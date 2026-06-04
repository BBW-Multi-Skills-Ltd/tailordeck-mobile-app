import type { JobStatus } from '../../types/job'
import type { DbJobStatus } from '../types'

export function mapJobStatusFromDb(status: DbJobStatus): JobStatus {
  if (status === 'completed') return 'Completed'
  if (status === 'in_progress') return 'In Progress'
  return 'Pending'
}

export function mapJobStatusToDb(status: JobStatus): DbJobStatus {
  if (status === 'Completed') return 'completed'
  if (status === 'In Progress') return 'in_progress'
  return 'pending'
}
