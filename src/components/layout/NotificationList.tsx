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
  const emptyCopy = getEmptyCopy(filter)

  return (
    <div className="notification-sheet-body">
      {notifications.length === 0 ? (
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
