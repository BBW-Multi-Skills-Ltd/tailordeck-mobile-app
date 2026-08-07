import { useQuery } from '@tanstack/react-query'
import { getJobStatusBreakdown, getMonthlyStats, getRecentJobs } from '../services/dashboardService'
import { queryKeys } from './queryKeys'

export function useMonthlyStatsQuery(enabled = true, monthCount = 6) {
  return useQuery({ queryKey: queryKeys.dashboardMonthly(monthCount), queryFn: () => getMonthlyStats(monthCount), enabled })
}

export function useJobStatusBreakdownQuery(enabled = true, monthKey?: string) {
  return useQuery({ queryKey: queryKeys.dashboardStatus(monthKey), queryFn: () => getJobStatusBreakdown(monthKey), enabled })
}

export function useRecentJobsQuery(limit = 5) {
  return useQuery({ queryKey: queryKeys.recentJobs(limit), queryFn: () => getRecentJobs(limit) })
}
