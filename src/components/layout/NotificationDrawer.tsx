import { X } from 'lucide-react'
import { NotificationFilters } from './NotificationFilters'
import { NotificationList } from './NotificationList'
import type { NotificationDrawerProps, NotificationFilter } from './notificationDrawer.types'

export default function NotificationDrawer({
  errorMessage,
  filter,
  notifications,
  onClearAll,
  onClose,
  onDelete,
  onFilterChange,
  onItemOpen,
  onMarkAllRead,
  onMarkRead,
}: NotificationDrawerProps) {
  const visibleNotifications = notifications.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !item.read
    return item.type === filter
  })

  return (
    <div className="notification-panel-overlay" role="dialog" aria-modal="true" aria-label="Notifications" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="notification-panel">
        <div className="notification-sheet-content">
          <header className="notification-panel-header">
            <div>
              <h2 className="notification-sheet-title">Notifications</h2>
              <p className="notification-panel-subtitle">Deadlines and unread updates.</p>
            </div>
            <button type="button" className="btn btn-ghost btn-icon notification-panel-close" aria-label="Close notifications" onClick={onClose}>
              <X size={20} />
            </button>
          </header>

          <div className="row gap-8 notification-panel-actions">
            <button type="button" className="btn btn-ghost notification-sheet-top-btn" onClick={onMarkAllRead}>Mark all as read</button>
            <button type="button" className="btn btn-ghost notification-sheet-top-btn danger" onClick={onClearAll}>Clear all</button>
          </div>

          <NotificationFilters activeFilter={filter} onChange={onFilterChange} />
          {errorMessage ? <p className="inline-feedback-error notification-panel-error" role="alert">{errorMessage}</p> : null}
          <NotificationList filter={filter} notifications={visibleNotifications} onDelete={onDelete} onItemOpen={onItemOpen} onMarkRead={onMarkRead} />
        </div>
      </aside>
    </div>
  )
}

export type { NotificationFilter }
