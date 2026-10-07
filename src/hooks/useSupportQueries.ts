import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupportTicket, getMySupportTicket, getMySupportTickets, getSupportTicketCooldown } from '../services/supportService'
import { queryKeys } from './queryKeys'

export function useMySupportTicketsQuery() {
  return useQuery({
    queryKey: queryKeys.supportTickets,
    queryFn: getMySupportTickets,
    staleTime: 30 * 1000,
  })
}

export function useMySupportTicketQuery(ticketId: string) {
  return useQuery({
    queryKey: [...queryKeys.supportTickets, 'detail', ticketId] as const,
    queryFn: () => getMySupportTicket(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 15 * 1000,
  })
}

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
