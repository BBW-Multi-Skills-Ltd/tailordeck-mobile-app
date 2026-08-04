import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSupportTicket } from '../services/supportService'
import { queryKeys } from './queryKeys'

export function useCreateSupportTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets })
    },
  })
}
