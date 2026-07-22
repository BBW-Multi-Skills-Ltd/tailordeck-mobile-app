import type { DetailedJobData } from '../../data/mockJobDetails'

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
