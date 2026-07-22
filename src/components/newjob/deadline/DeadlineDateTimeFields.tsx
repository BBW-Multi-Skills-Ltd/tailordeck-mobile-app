import { ChevronDown } from 'lucide-react'

export function DeadlineDateTimeFields({
  deadlineDate,
  deadlineTime,
  onDeadlineDateChange,
  onDeadlineTimeChange,
}: {
  deadlineDate: string
  deadlineTime: string
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
}) {
  return (
    <div className="card wizard-deadline-entry-card">
      <div className="wizard-deadline-input-grid">
        <label className="input-group">
          <span className="wizard-section-label">Delivery Date *</span>
          <div className="wizard-select-input-wrap">
            <input className="input wizard-select-input" type="date" value={deadlineDate} onChange={(event) => onDeadlineDateChange(event.target.value)} />
            <ChevronDown size={18} className="wizard-select-chevron" />
          </div>
        </label>

        <label className="input-group">
          <span className="wizard-section-label">Delivery Time</span>
          <div className="wizard-select-input-wrap">
            <input className="input wizard-select-input" type="time" value={deadlineTime} onChange={(event) => onDeadlineTimeChange(event.target.value)} />
            <ChevronDown size={18} className="wizard-select-chevron" />
          </div>
        </label>
      </div>
    </div>
  )
}
