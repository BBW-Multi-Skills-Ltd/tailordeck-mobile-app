import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiChevronDown, HiOutlineBell } from 'react-icons/hi2'
import { AVATAR_PLACEHOLDER, loadTailorSettings } from '../../lib/settings'
import { clearPreviewSession } from '../../lib/auth'
import {
  clearNotifications,
  deleteNotification,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationType,
} from '../../lib/notifications'
import { CalendarClock, CircleAlert, HandCoins, Trash2 } from 'lucide-react'

export default function AppHeader() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerDragOffset, setDrawerDragOffset] = useState(0)
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications())
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all')
  const menuRef = useRef<HTMLDivElement | null>(null)
  const drawerDragStartYRef = useRef<number | null>(null)
  const drawerDragPointerIdRef = useRef<number | null>(null)
  const isDrawerDraggingRef = useRef(false)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current) return
      const target = event.target
      if (target instanceof Node && !menuRef.current.contains(target)) {
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

  function closeNotificationDrawer() {
    setDrawerOpen(false)
    setDrawerDragOffset(0)
    drawerDragStartYRef.current = null
    drawerDragPointerIdRef.current = null
    isDrawerDraggingRef.current = false
    setFilter('all')
  }

  function onBellClick() {
    setMenuOpen(false)
    setDrawerDragOffset(0)
    setDrawerOpen(true)
  }

  function handleMarkAllRead() {
    setNotifications(markAllNotificationsRead())
  }

  function handleClearAll() {
    const ok = window.confirm('Clear all notifications?')
    if (!ok) return
    setNotifications(clearNotifications())
  }

  function handleItemOpen(item: AppNotification) {
    setNotifications(markNotificationRead(item.id))
    closeNotificationDrawer()
    navigate(item.href)
  }

  function handleMarkRead(id: string) {
    setNotifications(markNotificationRead(id))
  }

  function handleDelete(id: string) {
    setNotifications(deleteNotification(id))
  }

  function handleSignOut() {
    clearPreviewSession()
    setMenuOpen(false)
    navigate('/auth/signin')
  }

  useEffect(() => {
    function handleWindowPointerMove(event: PointerEvent): void {
      if (!isDrawerDraggingRef.current) return
      if (drawerDragPointerIdRef.current !== null && event.pointerId !== drawerDragPointerIdRef.current) return
      if (drawerDragStartYRef.current === null) return
      const deltaY = event.clientY - drawerDragStartYRef.current
      setDrawerDragOffset(Math.max(0, Math.min(260, deltaY)))
    }

    function handleWindowPointerUp(event: PointerEvent): void {
      if (!isDrawerDraggingRef.current) return
      if (drawerDragPointerIdRef.current !== null && event.pointerId !== drawerDragPointerIdRef.current) return
      if (drawerDragStartYRef.current === null) return
      const deltaY = event.clientY - drawerDragStartYRef.current
      drawerDragStartYRef.current = null
      drawerDragPointerIdRef.current = null
      isDrawerDraggingRef.current = false

      if (deltaY > 70) {
        closeNotificationDrawer()
        return
      }

      setDrawerDragOffset(0)
    }

    function handleWindowPointerCancel(): void {
      if (!isDrawerDraggingRef.current) return
      drawerDragStartYRef.current = null
      drawerDragPointerIdRef.current = null
      isDrawerDraggingRef.current = false
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

  function handleDrawerHandlePointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
    event.preventDefault()
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    drawerDragStartYRef.current = event.clientY
    drawerDragPointerIdRef.current = event.pointerId
    isDrawerDraggingRef.current = true
  }

  function handleDrawerHandlePointerCancel(): void {
    drawerDragStartYRef.current = null
    drawerDragPointerIdRef.current = null
    isDrawerDraggingRef.current = false
    setDrawerDragOffset(0)
  }

  function getRelativeTime(iso: string): string {
    const value = new Date(iso).getTime()
    if (Number.isNaN(value)) return ''
    const diffMs = value - Date.now()
    const diffMinutes = Math.round(diffMs / 60000)
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const absMinutes = Math.abs(diffMinutes)
    if (absMinutes < 60) return rtf.format(diffMinutes, 'minute')
    const diffHours = Math.round(diffMinutes / 60)
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
    const diffDays = Math.round(diffHours / 24)
    return rtf.format(diffDays, 'day')
  }

  const unreadCount = notifications.filter((item) => !item.read).length
  const visibleNotifications = notifications.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !item.read
    return item.type === filter
  })

  function getItemIcon(type: NotificationType) {
    if (type === 'deadline') return <CalendarClock size={16} />
    if (type === 'payment') return <HandCoins size={16} />
    return <CircleAlert size={16} />
  }

  return (
    <>
      <header className="app-shell-header">
        <div className="app-shell-left">
          <span className="app-shell-logo-wrap">
            <img src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png" alt="TailorDeck logo" className="app-shell-logo" />
          </span>
          <p className="app-shell-logo-text">TailorDeck</p>
        </div>

        <div className="app-shell-right app-header-actions">
          <div className="app-profile-menu" ref={menuRef}>
            <button
              type="button"
              className="app-profile-trigger"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open profile menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <img src={settings.profile.avatarUrl || AVATAR_PLACEHOLDER} alt="User avatar placeholder" className="app-profile-image" />
              <span className="app-business-name">{settings.businessInfo.shopName || 'Your Shop'}</span>
              <HiChevronDown size={16} className={`app-menu-chevron${menuOpen ? ' open' : ''}`} />
            </button>

            {menuOpen ? (
              <div className="app-profile-dropdown" role="menu" aria-label="Profile menu">
                <button type="button" className="app-profile-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                  My Profile
                </button>
                <Link to="/settings" className="app-profile-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <button
                  type="button"
                  className="app-profile-menu-item danger"
                  role="menuitem"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>

          <button type="button" className="btn btn-ghost btn-icon app-bell-button has-notification-badge" aria-label="Notifications" onClick={onBellClick}>
            {unreadCount > 0 ? (
              <span className="notification-badge notification-badge--bell-shoulder" aria-label="Unread notifications">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
            <HiOutlineBell size={20} />
          </button>
        </div>
      </header>

      {drawerOpen ? (
        <div
          className="sheet-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications drawer"
          onClick={(event) => event.target === event.currentTarget && closeNotificationDrawer()}
        >
          <div
            className="sheet notification-sheet"
            style={{
              transform: `translateY(${drawerDragOffset}px)`,
              transition: drawerDragStartYRef.current === null ? 'transform 180ms ease' : 'none',
            }}
          >
            <button
              type="button"
              className="sheet-handle-button"
              aria-label="Drag down to close notifications drawer"
              onClick={() => setDrawerDragOffset(0)}
              onPointerDown={handleDrawerHandlePointerDown}
              onPointerCancel={handleDrawerHandlePointerCancel}
            >
              <span className="sheet-handle" />
            </button>

            <div className="notification-sheet-content">
              <div className="row gap-8" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost notification-sheet-top-btn" onClick={handleMarkAllRead}>
                  Mark all as read
                </button>
                <button type="button" className="btn btn-ghost notification-sheet-top-btn danger" onClick={handleClearAll}>
                  Clear all
                </button>
              </div>

              <div className="notification-filter-row">
                {(['all', 'unread', 'deadline'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`notification-filter-pill${filter === item ? ' active' : ''}`}
                    onClick={() => setFilter(item)}
                  >
                    {item === 'all' ? 'All' : item === 'unread' ? 'Unread' : 'Deadlines'}
                  </button>
                ))}
              </div>

              <div className="notification-sheet-body">
                {visibleNotifications.length === 0 ? (
                  <div className="notification-empty">
                    <p className="notification-empty-title">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
                    <p className="notification-empty-sub">New alerts will show here when jobs need attention.</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {visibleNotifications.map((item) => (
                      <article key={item.id} className={`notification-item${item.read ? '' : ' unread'}`}>
                        <button type="button" className="notification-main" onClick={() => handleItemOpen(item)}>
                          <span className={`notification-icon ${item.type}`}>{getItemIcon(item.type)}</span>
                          <div className="notification-text">
                            <p className="notification-title">{item.title}</p>
                            <p className="notification-message">{item.message}</p>
                            <p className="notification-time">{getRelativeTime(item.createdAt)}</p>
                          </div>
                          {!item.read ? <span className="notification-unread-dot" aria-hidden /> : null}
                        </button>
                        <div className="notification-actions">
                          {!item.read ? (
                            <button type="button" className="btn btn-ghost notification-item-btn" onClick={() => handleMarkRead(item.id)}>
                              Mark read
                            </button>
                          ) : null}
                          <button type="button" className="btn btn-ghost notification-item-btn danger" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
