export type NotificationType = 'deadline' | 'balance' | 'document' | 'job'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  href: string
  createdAt: string
  read: boolean
}

export const TAILOR_NOTIFICATIONS_KEY = 'tailordeck-notifications'

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-deadline-1',
    type: 'deadline',
    title: 'Deadline tomorrow',
    message: 'Agbada for Mr. Ade is due tomorrow at 4:00 PM.',
    href: '/jobs/job-1',
    createdAt: '2026-05-24T08:10:00.000Z',
    read: false,
  },
  {
    id: 'notif-balance-1',
    type: 'balance',
    title: 'Balance pending',
    message: 'Wedding Lace order still has balance to collect.',
    href: '/jobs/job-2',
    createdAt: '2026-05-23T13:25:00.000Z',
    read: false,
  },
  {
    id: 'notif-document-1',
    type: 'document',
    title: 'Invoice sent',
    message: 'Invoice for Family Native Set was sent to the client.',
    href: '/jobs/job-1',
    createdAt: '2026-05-22T09:00:00.000Z',
    read: true,
  },
]

function dispatchNotificationsUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('tailordeck-notifications-updated'))
}

export function getDefaultNotifications(): AppNotification[] {
  return DEFAULT_NOTIFICATIONS
}

export function loadNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return getDefaultNotifications()
  const raw = window.localStorage.getItem(TAILOR_NOTIFICATIONS_KEY)
  if (!raw) return getDefaultNotifications()
  try {
    const parsed = JSON.parse(raw) as AppNotification[]
    if (!Array.isArray(parsed)) return getDefaultNotifications()
    return parsed.map(normalizeNotification)
  } catch {
    return getDefaultNotifications()
  }
}

function normalizeNotification(item: AppNotification): AppNotification {
  const legacyType = item.type as NotificationType | 'payment' | 'system'
  if (legacyType === 'payment') return { ...item, type: 'balance' }
  if (legacyType === 'system') return { ...item, type: 'job' }
  return item
}

export function saveNotifications(list: AppNotification[]): AppNotification[] {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TAILOR_NOTIFICATIONS_KEY, JSON.stringify(list))
    dispatchNotificationsUpdated()
  }
  return list
}

export function markNotificationRead(id: string): AppNotification[] {
  const current = loadNotifications()
  const next = current.map((item) => (item.id === id ? { ...item, read: true } : item))
  return saveNotifications(next)
}

export function markAllNotificationsRead(): AppNotification[] {
  const current = loadNotifications()
  const next = current.map((item) => ({ ...item, read: true }))
  return saveNotifications(next)
}

export function deleteNotification(id: string): AppNotification[] {
  const current = loadNotifications()
  const next = current.filter((item) => item.id !== id)
  return saveNotifications(next)
}

export function clearNotifications(): AppNotification[] {
  return saveNotifications([])
}
