import { AlertCircle, CheckCircle2, ChevronDown, Clock, WalletCards } from 'lucide-react'
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
  const reminderLabel = reminder === 'none' ? 'No reminder' : reminder
  const checklistItems = [
    {
      icon: <WalletCards size={15} />,
      label: 'Balance due',
      value: formatNaira(balance),
      complete: true,
    },
    {
      icon: <CheckCircle2 size={15} />,
      label: 'Delivery date',
      value: deadlineDate || 'Select date',
      complete: Boolean(deadlineDate),
    },
    {
      icon: <Clock size={15} />,
      label: 'Delivery time',
      value: deadlineTime || 'Optional',
      complete: Boolean(deadlineTime),
    },
    {
      icon: <AlertCircle size={15} />,
      label: 'Reminder',
      value: reminderLabel,
      complete: true,
    },
  ]

  return (
    <div className="stack gap-12">
      <article className="card stack gap-8 wizard-deadline-checklist">
        <div className="row-between">
          <div>
            <h4>Delivery Checklist</h4>
            <p className="text-sm text-muted">Confirm the details needed before final review.</p>
          </div>
          <span className={deadlineDate ? 'wizard-checklist-score is-ready' : 'wizard-checklist-score'}>
            {deadlineDate ? 'Ready' : '1 left'}
          </span>
        </div>
        <div className="wizard-checklist-grid">
          {checklistItems.map((item) => (
            <div key={item.label} className={`wizard-checklist-row${item.complete ? ' is-complete' : ''}`}>
              <span className="wizard-checklist-icon">{item.icon}</span>
              <span className="wizard-checklist-copy">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </span>
              <CheckCircle2 size={15} className="wizard-checklist-status" />
            </div>
          ))}
        </div>
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
