import type { AppNotification } from '../../lib/notifications'
import type { NotificationFilter } from './notificationDrawer.types'
import { NotificationItem } from './NotificationItem'

type NotificationListProps = {
  filter: NotificationFilter
  loading?: boolean
  notifications: AppNotification[]
  onDelete: (id: string) => void
  onItemOpen: (item: AppNotification) => void
  onMarkRead: (id: string) => void
}

export function NotificationList({ filter, loading = false, notifications, onDelete, onItemOpen, onMarkRead }: NotificationListProps) {
  const emptyCopy = getEmptyCopy(filter)
  const empty = notifications.length === 0

  return (
    <div className={`notification-sheet-body${empty && !loading ? ' is-empty' : ''}`}>
      {loading ? (
        <div className="notification-list" aria-label="Loading notifications">
          <NotificationSkeletonItem />
          <NotificationSkeletonItem />
          <NotificationSkeletonItem />
        </div>
      ) : empty ? (
        <div className="notification-empty">
          <p className="notification-empty-title">{emptyCopy.title}</p>
          <p className="notification-empty-sub">{emptyCopy.description}</p>
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

function NotificationSkeletonItem() {
  return (
    <div className="notification-item notification-skeleton-item" aria-hidden="true">
      <div className="notification-main">
        <span className="skeleton notification-skeleton-icon" />
        <div className="notification-text stack gap-4">
          <span className="skeleton notification-skeleton-line strong" />
          <span className="skeleton notification-skeleton-line" />
          <span className="skeleton notification-skeleton-line short" />
        </div>
      </div>
    </div>
  )
}

function getEmptyCopy(filter: NotificationFilter): { title: string; description: string } {
  if (filter === 'unread') {
    return {
      title: 'Nothing unread',
      description: 'When you mark alerts as read, they stay out of the way so you can focus.',
    }
  }

  if (filter === 'deadline') {
    return {
      title: 'No deadline alerts',
      description: 'Delivery reminders will appear here before jobs are due.',
    }
  }

  return {
    title: 'No notifications yet',
    description: 'Deadline reminders and important shop alerts will show here.',
  }
}
