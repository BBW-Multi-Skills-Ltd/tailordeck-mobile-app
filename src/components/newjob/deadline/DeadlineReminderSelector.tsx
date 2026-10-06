import { type Reminder, type ReminderSelection, type ReminderUnit } from '../newJobConfig'
import { getReminderLabel, REMINDER_PRESETS } from '../../../lib/jobReminder'
import {
  REMINDER_OPTIONS_AFTER_PRESETS,
  REMINDER_OPTIONS_BEFORE_PRESETS,
  useReminderChoice,
} from '../../../hooks/useReminderChoice'

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
  const { chooseCustom, chooseOption, choosePreset, customActive, isPresetActive } = useReminderChoice({
    reminder,
    customValue: customReminderValue,
    customUnit: customReminderUnit,
    onReminderChange,
    onCustomValueChange: onCustomReminderValueChange,
    onCustomUnitChange: onCustomReminderUnitChange,
  })

  const renderOption = (value: Reminder) => (
    <button key={value} type="button" className={`pill${reminder === value ? ' active' : ''}`} onClick={() => chooseOption(value)}>
      {value === 'none' ? 'No reminder' : value}
    </button>
  )

  return (
    <div className="input-group">
      <span className="wizard-section-label">Remind me before deadline</span>
      <div className={`wizard-reminder-scroll${error ? ' input-invalid input-shake' : ''}`} key={`reminder-options-${errorKey}`}>
        {REMINDER_OPTIONS_BEFORE_PRESETS.map(renderOption)}
        {REMINDER_PRESETS.map((preset) => (
          <button key={preset.label} type="button" className={`pill${isPresetActive(preset) ? ' active' : ''}`} onClick={() => choosePreset(preset)}>
            {preset.label}
          </button>
        ))}
        {REMINDER_OPTIONS_AFTER_PRESETS.map(renderOption)}
        <button type="button" className={`pill${customActive ? ' active' : ''}`} onClick={chooseCustom}>
          Custom
        </button>
      </div>
      {error ? <span className="input-error-text">{error}</span> : null}
      {customActive ? (
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
