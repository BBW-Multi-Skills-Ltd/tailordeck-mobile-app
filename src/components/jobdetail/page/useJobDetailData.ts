import { useMemo } from 'react'
import type { BrandConfig } from '../../invoice/documentTypes'
import { readBrandConfig } from '../../invoice/documentHelpers'
import type { DetailedJobData } from '../../../types/jobDetails'
import type { MockJob } from '../../../types/job'
import { useJobQuery } from '../../../hooks/useJobQueries'
import { getDefaultJobDetails, getJobDetailsFromRow, getMockJobFromRow } from '../jobDetailUtils'

export function useJobDetailData(id?: string) {
  const jobQuery = useJobQuery(id)
  const jobRow = jobQuery.data
  const brand = useMemo<BrandConfig>(() => readBrandConfig(), [])
  const job = useMemo<MockJob | undefined>(() => (jobRow ? getMockJobFromRow(jobRow) : undefined), [jobRow])
  const details = useMemo<DetailedJobData>(() => {
    if (jobRow) return getJobDetailsFromRow(jobRow)
    return getDefaultJobDetails(job)
  }, [job, jobRow])

  return { brand, details, job, jobQuery, jobRow }
}
