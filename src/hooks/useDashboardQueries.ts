import { useQuery } from '@tanstack/react-query'
import { getJobStatusBreakdown, getMonthlyStats, getRecentJobs } from '../services/dashboardService'
import { queryKeys } from './queryKeys'

export function useMonthlyStatsQuery() {
  return useQuery({ queryKey: queryKeys.dashboardMonthly, queryFn: getMonthlyStats })
}

export function useJobStatusBreakdownQuery() {
  return useQuery({ queryKey: queryKeys.dashboardStatus, queryFn: getJobStatusBreakdown })
}

export function useRecentJobsQuery(limit = 5) {
  return useQuery({ queryKey: queryKeys.recentJobs(limit), queryFn: () => getRecentJobs(limit) })
}
