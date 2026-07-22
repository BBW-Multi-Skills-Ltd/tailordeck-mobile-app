import { reminders, type Reminder } from '../newJobConfig'

export function DeadlineReminderSelector({ onReminderChange, reminder }: { reminder: Reminder; onReminderChange: (value: Reminder) => void }) {
  return (
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
  )
}
