import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExpense, deleteExpense, getJobExpenses } from '../services/expenseService'
import { queryKeys } from './queryKeys'

export function useJobExpensesQuery(jobId: string | undefined) {
  return useQuery({ queryKey: queryKeys.jobExpenses(jobId ?? ''), queryFn: () => getJobExpenses(jobId ?? ''), enabled: Boolean(jobId) })
}

export function useCreateExpenseMutation(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; cost: number }) => createExpense(jobId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.jobExpenses(jobId) }),
  })
}

export function useDeleteExpenseMutation(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: deleteExpense, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.jobExpenses(jobId) }) })
}
