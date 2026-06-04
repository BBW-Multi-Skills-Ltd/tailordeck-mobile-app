import type { NotificationFilter } from './notificationDrawer.types'

type NotificationFiltersProps = {
  activeFilter: NotificationFilter
  onChange: (filter: NotificationFilter) => void
}

export function NotificationFilters({ activeFilter, onChange }: NotificationFiltersProps) {
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
