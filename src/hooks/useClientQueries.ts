import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient, getClient, getClients, softDeleteClient, updateClient } from '../services/clientService'
import { queryKeys } from './queryKeys'

export function useClientsQuery() {
  return useQuery({ queryKey: queryKeys.clients, queryFn: getClients })
}

export function useClientQuery(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.client(id ?? ''), queryFn: () => getClient(id ?? ''), enabled: Boolean(id) })
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: createClient, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.clients }) })
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: ({ id, updates }: Parameters<typeof updateClient> extends [infer Id, infer Updates] ? { id: Id; updates: Updates } : never) => updateClient(id, updates), onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.clients }) })
}

export function useSoftDeleteClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: softDeleteClient, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.clients }) })
}
