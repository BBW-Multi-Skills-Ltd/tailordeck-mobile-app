import { ChevronDown } from 'lucide-react'
import { formatNaira } from '../../lib/utils'
import { reminders, type Reminder } from './newJobConfig'

type DeadlineFieldsProps = {
  balance: number
  deadlineDate: string
  deadlineTime: string
  reminder: Reminder
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
  onReminderChange: (value: Reminder) => void
}

export function DeadlineFields({
  balance,
  deadlineDate,
  deadlineTime,
  reminder,
  onDeadlineDateChange,
  onDeadlineTimeChange,
  onReminderChange,
}: DeadlineFieldsProps) {
  return (
    <div className="stack gap-12">
      <article className="card stack gap-8 wizard-deadline-checklist">
        <h4>Delivery Checklist</h4>
        <p className="text-sm text-muted">
          Balance due on delivery: <strong>{formatNaira(balance)}</strong>
        </p>
        <p className="text-sm text-muted">
          Reminder set: <strong>{reminder === 'none' ? 'No reminder' : reminder}</strong>
        </p>
        <p className="text-sm text-muted">
          Deadline readiness:{' '}
          <strong className={deadlineDate ? 'text-success' : 'text-danger'}>
            {deadlineDate ? 'Ready to proceed' : 'Select delivery date'}
          </strong>
        </p>
      </article>

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

      <div className="input-group">
        <span className="wizard-section-label">Remind me before deadline</span>
        <div className="wizard-reminder-scroll">
          {reminders.map((value) => (
            <button key={value} type="button" className={`pill${reminder === value ? ' active' : ''}`} onClick={() => onReminderChange(value)}>
              {value === 'none' ? 'No reminder' : value}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
