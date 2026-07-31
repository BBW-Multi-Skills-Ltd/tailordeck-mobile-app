import { ChevronDown } from 'lucide-react'

export function DeadlineDateTimeFields({
  deadlineDate,
  deadlineDateError,
  errorKey = 0,
  deadlineTime,
  deadlineTimeError,
  onDeadlineDateChange,
  onDeadlineTimeChange,
}: {
  deadlineDate: string
  deadlineDateError?: string
  errorKey?: number
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
              key={`deadline-date-${errorKey}`}
              className={`input wizard-select-input${deadlineDateError ? ' input-invalid input-shake' : ''}`}
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
              key={`deadline-time-${errorKey}`}
              className={`input wizard-select-input${deadlineTimeError ? ' input-invalid input-shake' : ''}`}
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
