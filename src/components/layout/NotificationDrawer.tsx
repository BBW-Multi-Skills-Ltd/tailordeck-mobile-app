import { NotificationFilters } from './NotificationFilters'
import { NotificationList } from './NotificationList'
import type { NotificationDrawerProps, NotificationFilter } from './notificationDrawer.types'

export default function NotificationDrawer({
  dragOffset,
  filter,
  isDragging,
  notifications,
  onClearAll,
  onClose,
  onDelete,
  onFilterChange,
  onHandleClick,
  onHandlePointerCancel,
  onHandlePointerDown,
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
    <div className="sheet-overlay" role="dialog" aria-modal="true" aria-label="Notifications drawer" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="sheet notification-sheet" style={{ transform: `translateY(${dragOffset}px)`, transition: isDragging ? 'none' : 'transform 180ms ease' }}>
        <button type="button" className="sheet-handle-button" aria-label="Drag down to close notifications drawer" onClick={onHandleClick} onPointerDown={onHandlePointerDown} onPointerCancel={onHandlePointerCancel}>
          <span className="sheet-handle" />
        </button>

        <div className="notification-sheet-content">
          <div className="row gap-8" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost notification-sheet-top-btn" onClick={onMarkAllRead}>Mark all as read</button>
            <button type="button" className="btn btn-ghost notification-sheet-top-btn danger" onClick={onClearAll}>Clear all</button>
          </div>

          <NotificationFilters activeFilter={filter} onChange={onFilterChange} />
          <NotificationList filter={filter} notifications={visibleNotifications} onDelete={onDelete} onItemOpen={onItemOpen} onMarkRead={onMarkRead} />
        </div>
      </div>
    </div>
  )
}

export type { NotificationFilter }
