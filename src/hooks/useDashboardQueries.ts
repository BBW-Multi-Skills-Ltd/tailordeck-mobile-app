import { useQuery } from '@tanstack/react-query'
import { getJobStatusBreakdown, getMonthlyStats, getRecentJobs } from '../services/dashboardService'
import { queryKeys } from './queryKeys'

export function useMonthlyStatsQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.dashboardMonthly, queryFn: getMonthlyStats, enabled })
}

export function useJobStatusBreakdownQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.dashboardStatus, queryFn: getJobStatusBreakdown, enabled })
}

export function useRecentJobsQuery(limit = 5) {
  return useQuery({ queryKey: queryKeys.recentJobs(limit), queryFn: () => getRecentJobs(limit) })
}
