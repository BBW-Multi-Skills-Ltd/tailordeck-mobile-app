import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { CalendarClock, CircleAlert, HandCoins, Trash2 } from 'lucide-react'
import type { AppNotification, NotificationType } from '../../lib/notifications'
import { getRelativeTime } from './appHeaderUtils'

type NotificationFilter = 'all' | 'unread' | NotificationType

type NotificationDrawerProps = {
  dragOffset: number
  filter: NotificationFilter
  isDragging: boolean
  notifications: AppNotification[]
  onClearAll: () => void
  onClose: () => void
  onDelete: (id: string) => void
  onFilterChange: (filter: NotificationFilter) => void
  onHandleClick: () => void
  onHandlePointerCancel: () => void
  onHandlePointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onItemOpen: (item: AppNotification) => void
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
}

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
      <div
        className="sheet notification-sheet"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 180ms ease',
        }}
      >
        <button
          type="button"
          className="sheet-handle-button"
          aria-label="Drag down to close notifications drawer"
          onClick={onHandleClick}
          onPointerDown={onHandlePointerDown}
          onPointerCancel={onHandlePointerCancel}
        >
          <span className="sheet-handle" />
        </button>

        <div className="notification-sheet-content">
          <div className="row gap-8" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost notification-sheet-top-btn" onClick={onMarkAllRead}>
              Mark all as read
            </button>
            <button type="button" className="btn btn-ghost notification-sheet-top-btn danger" onClick={onClearAll}>
              Clear all
            </button>
          </div>

          <NotificationFilters activeFilter={filter} onChange={onFilterChange} />
          <NotificationList filter={filter} notifications={visibleNotifications} onDelete={onDelete} onItemOpen={onItemOpen} onMarkRead={onMarkRead} />
        </div>
      </div>
    </div>
  )
}

function NotificationFilters({ activeFilter, onChange }: { activeFilter: NotificationFilter; onChange: (filter: NotificationFilter) => void }) {
  return (
    <div className="notification-filter-row">
      {(['all', 'unread', 'deadline'] as const).map((item) => (
        <button key={item} type="button" className={`notification-filter-pill${activeFilter === item ? ' active' : ''}`} onClick={() => onChange(item)}>
          {item === 'all' ? 'All' : item === 'unread' ? 'Unread' : 'Deadlines'}
        </button>
      ))}
    </div>
  )
}

function NotificationList({
  filter,
  notifications,
  onDelete,
  onItemOpen,
  onMarkRead,
}: {
  filter: NotificationFilter
  notifications: AppNotification[]
  onDelete: (id: string) => void
  onItemOpen: (item: AppNotification) => void
  onMarkRead: (id: string) => void
}) {
  return (
    <div className="notification-sheet-body">
      {notifications.length === 0 ? (
        <div className="notification-empty">
          <p className="notification-empty-title">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
          <p className="notification-empty-sub">New alerts will show here when jobs need attention.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((item) => (
            <NotificationItem key={item.id} item={item} onDelete={onDelete} onItemOpen={onItemOpen} onMarkRead={onMarkRead} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationItem({
  item,
  onDelete,
  onItemOpen,
  onMarkRead,
}: {
  item: AppNotification
  onDelete: (id: string) => void
  onItemOpen: (item: AppNotification) => void
  onMarkRead: (id: string) => void
}) {
  return (
    <article className={`notification-item${item.read ? '' : ' unread'}`}>
      <button type="button" className="notification-main" onClick={() => onItemOpen(item)}>
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
          <button type="button" className="btn btn-ghost notification-item-btn" onClick={() => onMarkRead(item.id)}>
            Mark read
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost notification-item-btn danger" onClick={() => onDelete(item.id)}>
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  )
}

function getItemIcon(type: NotificationType): ReactNode {
  if (type === 'deadline') return <CalendarClock size={16} />
  if (type === 'payment') return <HandCoins size={16} />
  return <CircleAlert size={16} />
}

export type { NotificationFilter }
