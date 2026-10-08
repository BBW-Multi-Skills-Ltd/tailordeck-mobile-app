import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getClient, getClientsPage, softDeleteClient } from '../services/clientService'
import { queryKeys } from './queryKeys'

/** Clients list in pages of 50 with server-side search; call fetchNextPage for "Load more". */
export function useClientsListQuery(search: string) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.clients, 'list', search.trim().toLowerCase()],
    queryFn: ({ pageParam }) => getClientsPage({ search, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    placeholderData: keepPreviousData,
  })
}

export function useClientQuery(id: string | undefined) {
  return useQuery({ queryKey: queryKeys.client(id ?? ''), queryFn: () => getClient(id ?? ''), enabled: Boolean(id) })
}

export function useSoftDeleteClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: softDeleteClient, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.clients }) })
}
