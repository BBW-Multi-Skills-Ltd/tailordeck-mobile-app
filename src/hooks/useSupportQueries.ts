import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  createSupportTicket,
  getMySupportTicket,
  getMySupportTickets,
  getSupportTicketCooldown,
  sendSupportMessage,
} from '../services/supportService'
import { queryKeys } from './queryKeys'

export function useMySupportTicketsQuery() {
  return useQuery({
    queryKey: queryKeys.supportTickets,
    queryFn: getMySupportTickets,
    staleTime: 30 * 1000,
  })
}

const ticketDetailKey = (ticketId: string) => [...queryKeys.supportTickets, 'detail', ticketId] as const

export function useMySupportTicketQuery(ticketId: string) {
  const queryClient = useQueryClient()

  // Live chat: refresh when support replies or changes the status.
  useEffect(() => {
    if (!ticketId) return undefined
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ticketDetailKey(ticketId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets, exact: true })
    }
    const channel = supabase
      .channel(`support-ticket-${ticketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_ticket_replies', filter: `ticket_id=eq.${ticketId}` }, refresh)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_tickets', filter: `id=eq.${ticketId}` }, refresh)
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient, ticketId])

  return useQuery({
    queryKey: ticketDetailKey(ticketId),
    queryFn: () => getMySupportTicket(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 15 * 1000,
  })
}

export function useSendSupportMessageMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { body: string; files: File[] }) => sendSupportMessage({ ticketId, ...input }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ticketDetailKey(ticketId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets, exact: true })
    },
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
