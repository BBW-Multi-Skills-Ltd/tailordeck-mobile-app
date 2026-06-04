import type { PointerEvent as ReactPointerEvent } from 'react'
import type { AppNotification, NotificationType } from '../../lib/notifications'

export type NotificationFilter = 'all' | 'unread' | NotificationType

export type NotificationDrawerProps = {
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
