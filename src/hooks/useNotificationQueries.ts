import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/authContextCore'
import { supabase } from '../lib/supabase'
import { clearNotifications, deleteNotification, getNotifications, markAllRead, markRead } from '../services/notificationService'
import { queryKeys } from './queryKeys'

export function useNotificationsQuery() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: () => getNotifications() })
}

export function useNotificationRealtime() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return undefined

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient, user?.id])
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
