import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJobPerson } from '../services/personService'
import type { JobPersonRow } from '../services/types'
import { queryKeys } from './queryKeys'

export function useUpdateJobPersonMutation(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<JobPersonRow> }) => updateJobPerson(id, updates),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.jobPersons(jobId) }),
  })
}
