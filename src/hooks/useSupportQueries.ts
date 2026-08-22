import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupportTicket, getSupportTicketCooldown } from '../services/supportService'
import { queryKeys } from './queryKeys'

export function useSupportCooldownQuery() {
  return useQuery({
    queryKey: queryKeys.supportCooldown,
    queryFn: getSupportTicketCooldown,
    staleTime: 15 * 1000,
  })
}

export function useCreateSupportTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets })
      void queryClient.invalidateQueries({ queryKey: queryKeys.supportCooldown })
    },
  })
}
