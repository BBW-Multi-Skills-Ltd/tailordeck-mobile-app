import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearPreviewSession } from '../../lib/auth'
import {
  clearNotifications,
  deleteNotification,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../../lib/notifications'
import { loadTailorSettings } from '../../lib/settings'
import type { NotificationFilter } from './NotificationDrawer'

export function useAppHeader() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerDragOffset, setDrawerDragOffset] = useState(0)
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications())
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const menuRef = useRef<HTMLDivElement | null>(null)
  const drawerDragStartYRef = useRef<number | null>(null)
  const drawerDragPointerIdRef = useRef<number | null>(null)
  const isDrawerDraggingRef = useRef(false)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target
      if (menuRef.current && target instanceof Node && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    function syncSettings() {
      setSettings(loadTailorSettings())
    }

    window.addEventListener('storage', syncSettings)
    window.addEventListener('tailordeck-settings-updated', syncSettings)
    return () => {
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener('tailordeck-settings-updated', syncSettings)
    }
  }, [])

  useEffect(() => {
    function syncNotifications() {
      setNotifications(loadNotifications())
    }

    window.addEventListener('storage', syncNotifications)
    window.addEventListener('tailordeck-notifications-updated', syncNotifications)
    return () => {
      window.removeEventListener('storage', syncNotifications)
      window.removeEventListener('tailordeck-notifications-updated', syncNotifications)
    }
  }, [])

  useEffect(() => {
    function handleWindowPointerMove(event: PointerEvent): void {
      if (!isDrawerDraggingRef.current) return
      if (drawerDragPointerIdRef.current !== null && event.pointerId !== drawerDragPointerIdRef.current) return
      if (drawerDragStartYRef.current === null) return
      setDrawerDragOffset(Math.max(0, Math.min(260, event.clientY - drawerDragStartYRef.current)))
    }

    function handleWindowPointerUp(event: PointerEvent): void {
      if (!isDrawerDraggingRef.current) return
      if (drawerDragPointerIdRef.current !== null && event.pointerId !== drawerDragPointerIdRef.current) return
      if (drawerDragStartYRef.current === null) return
      const deltaY = event.clientY - drawerDragStartYRef.current
      resetDrawerDrag()

      if (deltaY > 70) {
        closeNotificationDrawer()
        return
      }

      setDrawerDragOffset(0)
    }

    function handleWindowPointerCancel(): void {
      if (!isDrawerDraggingRef.current) return
      resetDrawerDrag()
      setDrawerDragOffset(0)
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerCancel)

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerCancel)
    }
  }, [])

  function resetDrawerDrag(): void {
    drawerDragStartYRef.current = null
    drawerDragPointerIdRef.current = null
    isDrawerDraggingRef.current = false
  }

  function closeNotificationDrawer(): void {
    setDrawerOpen(false)
    setDrawerDragOffset(0)
    resetDrawerDrag()
    setFilter('all')
  }

  function handleBellClick(): void {
    setMenuOpen(false)
    setDrawerDragOffset(0)
    setDrawerOpen(true)
  }

  function handleClearAll(): void {
    if (window.confirm('Clear all notifications?')) {
      setNotifications(clearNotifications())
    }
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

  function handleDrawerHandlePointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
    event.preventDefault()
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    drawerDragStartYRef.current = event.clientY
    drawerDragPointerIdRef.current = event.pointerId
    isDrawerDraggingRef.current = true
  }

  return {
    actions: {
      closeNotificationDrawer,
      handleBellClick,
      handleClearAll,
      handleDrawerHandlePointerCancel: () => {
        resetDrawerDrag()
        setDrawerDragOffset(0)
      },
      handleDrawerHandlePointerDown,
      handleItemOpen,
      handleSignOut,
      markAllRead: () => setNotifications(markAllNotificationsRead()),
      markRead: (id: string) => setNotifications(markNotificationRead(id)),
      deleteItem: (id: string) => setNotifications(deleteNotification(id)),
      setFilter,
      setMenuOpen,
    },
    menuRef,
    state: {
      drawerDragOffset,
      drawerOpen,
      filter,
      isDrawerDragging: isDrawerDraggingRef.current,
      menuOpen,
      notifications,
      settings,
      unreadCount: notifications.filter((item) => !item.read).length,
    },
  }
}
