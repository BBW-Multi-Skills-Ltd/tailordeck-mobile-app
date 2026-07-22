import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { clearPreviewSession } from '../../lib/auth'
import {
  clearNotifications,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../../lib/notifications'
import type { NotificationFilter } from './NotificationDrawer'
import { useSyncedHeaderSettings, useSyncedNotifications } from './useAppHeaderData'

export function useAppHeader() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const menuRef = useRef<HTMLDivElement | null>(null)
  const settings = useSyncedHeaderSettings()
  const { notifications, setNotifications } = useSyncedNotifications()

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
  }

  function handleBellClick(): void {
    setMenuOpen(false)
    setDrawerOpen(true)
  }

  function handleClearAll(): void {
    if (window.confirm('Clear all notifications?')) setNotifications(clearNotifications())
  }

  function handleItemOpen(item: AppNotification): void {
    setNotifications(markNotificationRead(item.id))
    closeNotificationDrawer()
    navigate(item.href)
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
      deleteItem: (id: string) => setNotifications(deleteNotification(id)),
      handleBellClick,
      handleClearAll,
      handleItemOpen,
      handleSignOut,
      confirmSignOut,
      markAllRead: () => setNotifications(markAllNotificationsRead()),
      markRead: (id: string) => setNotifications(markNotificationRead(id)),
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
      signOutConfirmOpen,
      settings,
      unreadCount: notifications.filter((item) => !item.read).length,
    },
  }
}
