import type { NotificationFilter } from './notificationDrawer.types'

type NotificationFiltersProps = {
  activeFilter: NotificationFilter
  onChange: (filter: NotificationFilter) => void
}

export function NotificationFilters({ activeFilter, onChange }: NotificationFiltersProps) {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'deadline', label: 'Deadlines' },
    { key: 'document', label: 'Documents' },
    { key: 'account', label: 'Account' },
  ] as const

  return (
    <div className="notification-filter-row" role="tablist" aria-label="Notification filters">
      {filters.map((item) => (
        <button key={item.key} type="button" role="tab" aria-selected={activeFilter === item.key} className={`notification-filter-pill${activeFilter === item.key ? ' active' : ''}`} onClick={() => onChange(item.key)}>
          {item.label}
        </button>
      ))}
    </div>
  )
}
