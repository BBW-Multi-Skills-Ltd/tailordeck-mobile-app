import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useNotificationDrawerDrag } from './useNotificationDrawerDrag'

export function useAppHeader() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const menuRef = useRef<HTMLDivElement | null>(null)
  const settings = useSyncedHeaderSettings()
  const { notifications, setNotifications } = useSyncedNotifications()
  const drawerDrag = useNotificationDrawerDrag({ onClose: closeNotificationDrawer })

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
    drawerDrag.setDragOffset(0)
    drawerDrag.resetDrag()
    setFilter('all')
  }

  function handleBellClick(): void {
    setMenuOpen(false)
    drawerDrag.setDragOffset(0)
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
    clearPreviewSession()
    setMenuOpen(false)
    navigate('/auth/signin')
  }

  return {
    actions: {
      closeNotificationDrawer,
      deleteItem: (id: string) => setNotifications(deleteNotification(id)),
      handleBellClick,
      handleClearAll,
      handleDrawerHandlePointerCancel: drawerDrag.cancelDrag,
      handleDrawerHandlePointerDown: drawerDrag.handlePointerDown,
      handleItemOpen,
      handleSignOut,
      markAllRead: () => setNotifications(markAllNotificationsRead()),
      markRead: (id: string) => setNotifications(markNotificationRead(id)),
      setFilter,
      setMenuOpen,
    },
    menuRef,
    state: {
      drawerDragOffset: drawerDrag.dragOffset,
      drawerOpen,
      filter,
      isDrawerDragging: drawerDrag.isDragging,
      menuOpen,
      notifications,
      settings,
      unreadCount: notifications.filter((item) => !item.read).length,
    },
  }
}
