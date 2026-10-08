// In-app notification shape. Notifications are stored in the `notifications` table and loaded by
// src/services/notificationService.ts (rows mapped in src/services/mappers/notificationMapper.ts).

export type NotificationType = 'deadline' | 'balance' | 'document' | 'job' | 'account'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  href: string
  createdAt: string
  read: boolean
}
