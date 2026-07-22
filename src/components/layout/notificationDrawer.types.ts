import type { AppNotification, NotificationType } from '../../lib/notifications'

export type NotificationFilter = 'all' | 'unread' | NotificationType

export type NotificationDrawerProps = {
  filter: NotificationFilter
  notifications: AppNotification[]
  onClearAll: () => void
  onClose: () => void
  onDelete: (id: string) => void
  onFilterChange: (filter: NotificationFilter) => void
  onItemOpen: (item: AppNotification) => void
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
}
