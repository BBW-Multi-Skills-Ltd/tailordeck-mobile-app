import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContextCore'
import {
  useClearNotificationsMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../../hooks/useNotificationQueries'
import { clearPreviewSession } from '../../lib/auth'
import type { AppNotification } from '../../lib/notifications'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { useAppFeedback } from '../shared/appFeedbackCore'
import type { NotificationFilter } from './NotificationDrawer'
import { useSyncedHeaderSettings } from './useAppHeaderData'

export function useAppHeader() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const feedback = useAppFeedback()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const menuRef = useRef<HTMLDivElement | null>(null)
  const settings = useSyncedHeaderSettings()
  const notificationsQuery = useNotificationsQuery()
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const deleteMutation = useDeleteNotificationMutation()
  const clearMutation = useClearNotificationsMutation()
  const notifications = notificationsQuery.data ?? []

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target
      if (menuRef.current && target instanceof Node && !menuRef.current.contains(target)) setMenuOpen(false)
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function closeNotificationDrawer(): void {
    setDrawerOpen(false)
    setFilter('all')
    setNotificationError('')
  }

  function handleBellClick(): void {
    setMenuOpen(false)
    setNotificationError('')
    setDrawerOpen(true)
  }

  async function handleClearAll(): Promise<void> {
    if (notifications.length === 0) return
    const confirmed = await feedback.confirm({
      title: 'Clear notifications?',
      message: 'This removes all notifications from your TailorDeck account.',
      confirmLabel: 'Clear all',
      tone: 'danger',
    })
    if (!confirmed) return

    try {
      setNotificationError('')
      await clearMutation.mutateAsync()
    } catch (error) {
      setNotificationError(getServiceErrorMessage(error, 'Unable to clear notifications.'))
    }
  }

  async function handleItemOpen(item: AppNotification): Promise<void> {
    try {
      setNotificationError('')
      if (!item.read) await markReadMutation.mutateAsync(item.id)
    } catch (error) {
      setNotificationError(getServiceErrorMessage(error, 'Unable to mark notification as read.'))
      return
    }
    closeNotificationDrawer()
    navigate(item.href)
  }

  async function handleDeleteItem(id: string): Promise<void> {
    try {
      setNotificationError('')
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      setNotificationError(getServiceErrorMessage(error, 'Unable to delete notification.'))
    }
  }

  async function handleMarkRead(id: string): Promise<void> {
    try {
      setNotificationError('')
      await markReadMutation.mutateAsync(id)
    } catch (error) {
      setNotificationError(getServiceErrorMessage(error, 'Unable to mark notification as read.'))
    }
  }

  async function handleMarkAllRead(): Promise<void> {
    try {
      setNotificationError('')
      await markAllReadMutation.mutateAsync()
    } catch (error) {
      setNotificationError(getServiceErrorMessage(error, 'Unable to mark notifications as read.'))
    }
  }

  function handleSignOut(): void {
    setMenuOpen(false)
    setSignOutConfirmOpen(true)
  }

  async function confirmSignOut(): Promise<void> {
    clearPreviewSession()
    setSignOutConfirmOpen(false)
    setMenuOpen(false)
    await signOut()
    navigate('/auth/signin')
  }

  return {
    actions: {
      closeNotificationDrawer,
      deleteItem: (id: string) => void handleDeleteItem(id),
      handleBellClick,
      handleClearAll: () => void handleClearAll(),
      handleItemOpen: (item: AppNotification) => void handleItemOpen(item),
      handleSignOut,
      confirmSignOut,
      markAllRead: () => void handleMarkAllRead(),
      markRead: (id: string) => void handleMarkRead(id),
      setFilter,
      setMenuOpen,
      setSignOutConfirmOpen,
    },
    menuRef,
    state: {
      drawerOpen,
      filter,
      menuOpen,
      notifications,
      notificationError,
      notificationsLoading: notificationsQuery.isLoading,
      signOutConfirmOpen,
      settings,
      unreadCount: notifications.filter((item) => !item.read).length,
    },
  }
}
