import { ChevronDown } from 'lucide-react'

export function DeadlineDateTimeFields({
  deadlineDate,
  deadlineDateError,
  deadlineTime,
  deadlineTimeError,
  onDeadlineDateChange,
  onDeadlineTimeChange,
}: {
  deadlineDate: string
  deadlineDateError?: string
  deadlineTime: string
  deadlineTimeError?: string
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
}) {
  return (
    <div className="card wizard-deadline-entry-card">
      <div className="wizard-deadline-input-grid">
        <label className="input-group">
          <span className="wizard-section-label">Delivery Date *</span>
          <div className="wizard-select-input-wrap">
            <input
              className={`input wizard-select-input${deadlineDateError ? ' input-invalid' : ''}`}
              type="date"
              value={deadlineDate}
              onChange={(event) => onDeadlineDateChange(event.target.value)}
              aria-invalid={Boolean(deadlineDateError)}
            />
            <ChevronDown size={18} className="wizard-select-chevron" />
          </div>
          {deadlineDateError ? <span className="input-error-text">{deadlineDateError}</span> : null}
        </label>

        <label className="input-group">
          <span className="wizard-section-label">Delivery Time *</span>
          <div className="wizard-select-input-wrap">
            <input
              className={`input wizard-select-input${deadlineTimeError ? ' input-invalid' : ''}`}
              type="time"
              value={deadlineTime}
              onChange={(event) => onDeadlineTimeChange(event.target.value)}
              aria-invalid={Boolean(deadlineTimeError)}
            />
            <ChevronDown size={18} className="wizard-select-chevron" />
          </div>
          {deadlineTimeError ? <span className="input-error-text">{deadlineTimeError}</span> : null}
        </label>
      </div>
    </div>
  )
}
