import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="empty-state card">
      {Icon ? (
        <div className="empty-state-icon">
          <Icon size={28} />
        </div>
      ) : null}
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
