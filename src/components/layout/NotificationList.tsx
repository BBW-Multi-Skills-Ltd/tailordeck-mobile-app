import type { AppNotification } from '../../lib/notifications'
import type { NotificationFilter } from './notificationDrawer.types'
import { NotificationItem } from './NotificationItem'

type NotificationListProps = {
  filter: NotificationFilter
  notifications: AppNotification[]
  onDelete: (id: string) => void
  onItemOpen: (item: AppNotification) => void
  onMarkRead: (id: string) => void
}

export function NotificationList({ filter, notifications, onDelete, onItemOpen, onMarkRead }: NotificationListProps) {
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
