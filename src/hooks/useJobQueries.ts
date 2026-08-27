import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { JobStatus } from '../types/job'
import { createFullJob, createJob, getClientJobs, getJob, getJobs, softDeleteJob, updateFullJob, updateJob, updateJobStatus, type CreateFullJobInput, type CreateJobInput } from '../services/jobService'
import { queryKeys } from './queryKeys'

export function useJobsQuery(status?: JobStatus) {
  return useQuery({ queryKey: queryKeys.jobs(status), queryFn: () => getJobs(status) })
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

export function useCreateJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
    },
  })
}

export function useCreateFullJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFullJobInput) => createFullJob(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthly'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'status'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.recentJobs(3) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.recentJobs(5) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
    },
  })
}

export function useUpdateFullJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateFullJobInput }) => updateFullJob(id, input),
    onSuccess: (_job, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.job(vars.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthly'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'status'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.recentJobs(3) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.recentJobs(5) })
    },
  })
}

export function useUpdateJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateJobInput> }) => updateJob(id, updates),
    onSuccess: (_job, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.job(vars.id) })
    },
  })
}

export function useUpdateJobStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => updateJobStatus(id, status),
    onSuccess: (_job, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.job(vars.id) })
    },
  })
}

export function useSoftDeleteJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: softDeleteJob,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
    },
  })
}
