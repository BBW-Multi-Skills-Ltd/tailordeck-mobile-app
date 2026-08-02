import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clearNotifications, deleteNotification, getNotifications, markAllRead, markRead } from '../services/notificationService'
import { queryKeys } from './queryKeys'

export function useNotificationsQuery() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: () => getNotifications() })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: markRead, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications }) })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: markAllRead, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications }) })
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: deleteNotification, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications }) })
}

export function useClearNotificationsMutation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: clearNotifications, onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications }) })
}
