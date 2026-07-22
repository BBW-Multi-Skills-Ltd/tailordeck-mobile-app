import { ChevronDown, ChevronUp, Trash2, UserRound } from 'lucide-react'

export function PersonCardHeader({
  allowRemove,
  isOpen,
  onRemoveClick,
  onToggle,
  subtitle,
  title,
}: {
  allowRemove: boolean
  isOpen: boolean
  title: string
  subtitle: string
  onToggle: () => void
  onRemoveClick: () => void
}) {
  return (
    <div className="row-between">
      <button type="button" className="row gap-8 wizard-person-toggle flex-1" onClick={onToggle} aria-expanded={isOpen}>
        <div className="wizard-person-icon center">
          <UserRound size={14} />
        </div>
        <div className="stack gap-4 text-left">
          <h5>{title}</h5>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
      </button>

      <div className="row gap-8">
        {allowRemove ? (
          <button type="button" className="btn btn-ghost btn-icon wizard-person-remove-btn" onClick={onRemoveClick} aria-label={`Remove ${title}`}>
            <Trash2 size={15} />
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost btn-icon" onClick={onToggle} aria-label={isOpen ? 'Collapse measurements' : 'Expand measurements'} aria-expanded={isOpen}>
          {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        </button>
      </div>
    </div>
  )
}
