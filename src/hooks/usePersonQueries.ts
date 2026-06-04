import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createJobPerson, getJobPersons, updateJobPerson } from '../services/personService'
import type { JobPersonRow } from '../services/types'
import { queryKeys } from './queryKeys'

export function useJobPersonsQuery(jobId: string | undefined) {
  return useQuery({ queryKey: queryKeys.jobPersons(jobId ?? ''), queryFn: () => getJobPersons(jobId ?? ''), enabled: Boolean(jobId) })
}

export function useCreateJobPersonMutation(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<JobPersonRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => createJobPerson(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.jobPersons(jobId) }),
  })
}

export function useUpdateJobPersonMutation(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<JobPersonRow> }) => updateJobPerson(id, updates),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.jobPersons(jobId) }),
  })
}
