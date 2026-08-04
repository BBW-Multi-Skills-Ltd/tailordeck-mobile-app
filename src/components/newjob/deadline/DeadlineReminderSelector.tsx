import { reminders, type Reminder, type ReminderSelection } from '../newJobConfig'

export function DeadlineReminderSelector({
  error,
  errorKey = 0,
  onReminderChange,
  reminder,
}: {
  error?: string
  errorKey?: number
  reminder: ReminderSelection
  onReminderChange: (value: Reminder) => void
}) {
  return (
    <div className="input-group">
      <span className="wizard-section-label">Remind me before deadline</span>
      <div className={`wizard-reminder-scroll${error ? ' input-invalid input-shake' : ''}`} key={`reminder-options-${errorKey}`}>
        {reminders.map((value) => (
          <button key={value} type="button" className={`pill${reminder === value ? ' active' : ''}`} onClick={() => onReminderChange(value)}>
            {value === 'none' ? 'No reminder' : value}
          </button>
        ))}
      </div>
      {error ? <span className="input-error-text">{error}</span> : null}
    </div>
  )
}
