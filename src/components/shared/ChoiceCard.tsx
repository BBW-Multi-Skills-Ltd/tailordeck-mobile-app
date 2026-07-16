import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ChoiceCardProps = {
  title: string
  description?: string
  icon?: LucideIcon
  active?: boolean
  children?: ReactNode
  className?: string
  onClick: () => void
}

export default function ChoiceCard({
  title,
  description,
  icon: Icon,
  active = false,
  children,
  className,
  onClick,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      className={`td-choice-card${active ? ' active' : ''}${className ? ` ${className}` : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {Icon ? (
        <span className="td-choice-icon">
          <Icon size={14} />
        </span>
      ) : null}
      <span className="td-choice-copy">
        <span className="td-choice-title">{title}</span>
        {description ? <span className="td-choice-description">{description}</span> : null}
      </span>
      {children}
    </button>
  )
}
