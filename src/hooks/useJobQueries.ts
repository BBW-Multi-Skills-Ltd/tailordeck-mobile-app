import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { JobStatus } from '../types/job'
import { getClientJobs, getJob, getJobReminderSchedules, getJobsPage, saveFullJob, updateJobStatus, type CreateFullJobInput } from '../services/jobService'
import { queryKeys } from './queryKeys'

/** Jobs list in pages of 50 with server-side search; call fetchNextPage for "Load more". */
export function useJobsListQuery(status: JobStatus | undefined, search: string) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.jobs(status), 'list', search.trim().toLowerCase()],
    queryFn: ({ pageParam }) => getJobsPage({ status, search, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    placeholderData: keepPreviousData,
  })
}

export function useJobQuery(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.job(id ?? ''), queryFn: () => getJob(id ?? ''), enabled: Boolean(id) })
}

export function useClientJobsQuery(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clientJobs(clientId ?? ''),
    queryFn: () => getClientJobs(clientId ?? ''),
    enabled: Boolean(clientId),
  })
}

export function useJobReminderSchedulesQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.jobReminderSchedules,
    queryFn: () => getJobReminderSchedules(),
    enabled,
    staleTime: 1000 * 60,
  })
}

/** Creates or updates a full job (one transaction, retry-safe). See saveFullJob. */
export function useSaveFullJobMutation() {
  const queryClient = useQueryClient()
  const refresh = (jobId: string) => {
    void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.clients })
    void queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthly'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard', 'status'] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.homeSummary })
    void queryClient.invalidateQueries({ queryKey: queryKeys.recentJobs(3) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.recentJobs(5) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobReminderSchedules })
  }
  return useMutation({
    mutationFn: (vars: { jobId: string; newClientId: string; input: CreateFullJobInput }) => saveFullJob(vars),
    // A photo-only failure still saved the job, so lists must refresh either way.
    onSettled: (_job, _error, vars) => refresh(vars.jobId),
  })
}

export function useUpdateJobStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => updateJobStatus(id, status),
    onSuccess: (_job, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.job(vars.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.homeSummary })
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobReminderSchedules })
    },
  })
}
