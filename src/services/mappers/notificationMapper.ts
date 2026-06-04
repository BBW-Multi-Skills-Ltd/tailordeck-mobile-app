import type { AppNotification, NotificationType } from '../../lib/notifications'
import type { DbNotificationType, NotificationRow } from '../types'

function mapNotificationType(type: DbNotificationType): NotificationType {
  if (type === 'deadline') return 'deadline'
  if (type === 'balance' || type === 'invoice') return 'payment'
  return 'system'
}

export function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: mapNotificationType(row.type),
    title: row.title,
    message: row.message,
    href: row.action_url ?? '/',
    createdAt: row.created_at,
    read: Boolean(row.read_at),
  }
}

