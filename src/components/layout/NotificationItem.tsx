import type { ReactNode } from 'react'
import { CalendarClock, CheckCircle2, FileText, HandCoins, Scissors, Trash2 } from 'lucide-react'
import type { AppNotification, NotificationType } from '../../lib/notifications'
import { getRelativeTime } from './appHeaderUtils'

type NotificationItemProps = {
  item: AppNotification
  onDelete: (id: string) => void
  onItemOpen: (item: AppNotification) => void
  onMarkRead: (id: string) => void
}

export function NotificationItem({ item, onDelete, onItemOpen, onMarkRead }: NotificationItemProps) {
  return (
    <article className={`notification-item${item.read ? '' : ' unread'}`}>
      <button type="button" className="notification-main" aria-label={`Open notification: ${item.title}`} onClick={() => onItemOpen(item)}>
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
          <button type="button" className="btn btn-ghost notification-item-btn" aria-label={`Mark ${item.title} as read`} onClick={() => onMarkRead(item.id)}>Mark read</button>
        ) : null}
        <button type="button" className="btn btn-ghost notification-item-btn danger" aria-label={`Delete notification: ${item.title}`} onClick={() => onDelete(item.id)}>
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  )
}

function getItemIcon(type: NotificationType): ReactNode {
  if (type === 'deadline') return <CalendarClock size={16} />
  if (type === 'balance') return <HandCoins size={16} />
  if (type === 'document') return <FileText size={16} />
  if (type === 'job') return <Scissors size={16} />
  return <CheckCircle2 size={16} />
}
