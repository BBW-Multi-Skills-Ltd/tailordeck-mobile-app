import { reminders, type Reminder, type ReminderSelection, type ReminderUnit } from '../newJobConfig'
import { getReminderLabel } from '../../../lib/jobReminder'

export function DeadlineReminderSelector({
  customReminderUnit,
  customReminderValue,
  error,
  customError,
  errorKey = 0,
  onCustomReminderUnitChange,
  onCustomReminderValueChange,
  onReminderChange,
  reminder,
}: {
  customReminderValue: string
  customReminderUnit: ReminderUnit
  error?: string
  customError?: string
  errorKey?: number
  reminder: ReminderSelection
  onReminderChange: (value: Reminder) => void
  onCustomReminderValueChange: (value: string) => void
  onCustomReminderUnitChange: (value: ReminderUnit) => void
}) {
  const units: ReminderUnit[] = ['minutes', 'hours', 'days', 'weeks']
  const reminderPreview = getReminderLabel('custom', customReminderValue, customReminderUnit)

  return (
    <div className="input-group">
      <span className="wizard-section-label">Remind me before deadline</span>
      <div className={`wizard-reminder-scroll${error ? ' input-invalid input-shake' : ''}`} key={`reminder-options-${errorKey}`}>
        {reminders.map((value) => (
          <button key={value} type="button" className={`pill${reminder === value ? ' active' : ''}`} onClick={() => onReminderChange(value)}>
            {value === 'none' ? 'No reminder' : value === 'custom' ? 'Custom' : value}
          </button>
        ))}
      </div>
      {error ? <span className="input-error-text">{error}</span> : null}
      {reminder === 'custom' ? (
        <div className={`wizard-custom-reminder${customError ? ' input-invalid input-shake' : ''}`} key={`custom-reminder-${errorKey}`}>
          <label className="wizard-custom-reminder-field">
            <span>Custom time</span>
            <div className="wizard-custom-reminder-input-wrap">
              <input
                className="input wizard-custom-reminder-input"
                inputMode="numeric"
                placeholder="2"
                value={customReminderValue}
                onChange={(event) => onCustomReminderValueChange(event.target.value)}
              />
              <span className="wizard-custom-reminder-input-unit">{customReminderUnit}</span>
            </div>
          </label>
          <div className="wizard-custom-reminder-units" role="group" aria-label="Custom reminder unit">
            {units.map((unit) => (
              <button
                key={unit}
                type="button"
                className={`settings-choice-pill wizard-custom-reminder-unit${customReminderUnit === unit ? ' active' : ''}`}
                aria-pressed={customReminderUnit === unit}
                onClick={() => onCustomReminderUnitChange(unit)}
              >
                {unit}
              </button>
            ))}
          </div>
          <div className="wizard-custom-reminder-preview" aria-live="polite">
            {reminderPreview}
          </div>
          <p className="wizard-custom-reminder-note">Allowed range: 10 minutes to 30 days before delivery.</p>
          {customError ? <span className="input-error-text">{customError}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
