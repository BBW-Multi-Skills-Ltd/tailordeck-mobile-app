import { Toggle } from './SettingsRows'
import { cleanReminderValue, getReminderLabel } from '../../lib/jobReminder'
import type { ReminderLead, ReminderUnit, TailorSettings } from '../../lib/settings'

type RemindersPanelProps = {
  settings: TailorSettings
  saved: boolean
  onPushNotificationsChange: (value: boolean) => void
  onDefaultReminderChange: (value: ReminderLead) => void
  onDefaultCustomReminderValueChange: (value: string) => void
  onDefaultCustomReminderUnitChange: (value: ReminderUnit) => void
  onSave: () => void
  customReminderError?: string
}

export default function RemindersPanel({
  customReminderError,
  settings,
  saved,
  onDefaultCustomReminderUnitChange,
  onDefaultCustomReminderValueChange,
  onPushNotificationsChange,
  onDefaultReminderChange,
  onSave,
}: RemindersPanelProps) {
  const reminderOptions: ReminderLead[] = ['1 day before', '3 days before', '1 week before', 'custom', 'none']
  const reminderUnits: ReminderUnit[] = ['minutes', 'hours', 'days', 'weeks']
  const customReminderPreview = getReminderLabel(
    'custom',
    settings.reminders.defaultCustomReminderValue,
    settings.reminders.defaultCustomReminderUnit,
  )

  return (
    <div className="stack settings-reminder-form">
      <section className="clay-card settings-reminder-card row-between settings-reminder-row">
        <div className="stack gap-4">
          <p className="settings-reminder-label">Push Notifications</p>
          <p className="settings-reminder-help">Phone pop-up alerts for deadlines and updates.</p>
        </div>
        <Toggle checked={settings.reminders.pushNotifications} onChange={onPushNotificationsChange} />
      </section>

      <section className="clay-card settings-reminder-card stack settings-reminder-group">
        <p className="settings-reminder-label">Default Reminder</p>
        <p className="settings-help-text">How early we notify you before delivery deadline.</p>
        <div className="settings-reminder-chip-row">
          {reminderOptions.map((reminder) => (
            <button key={reminder} type="button" className={`settings-choice-pill settings-reminder-chip${settings.reminders.defaultReminder === reminder ? ' active' : ''}`} onClick={() => onDefaultReminderChange(reminder)}>
              {reminder === 'none' ? 'No reminder' : reminder === 'custom' ? 'Custom' : reminder}
            </button>
          ))}
        </div>
        {settings.reminders.defaultReminder === 'custom' ? (
          <div className={`wizard-custom-reminder settings-custom-reminder${customReminderError ? ' input-invalid input-shake' : ''}`}>
            <label className="wizard-custom-reminder-field">
              <span>Custom time</span>
              <div className="wizard-custom-reminder-input-wrap">
                <input
                  className="input wizard-custom-reminder-input"
                  inputMode="numeric"
                  placeholder="2"
                  value={settings.reminders.defaultCustomReminderValue}
                  onChange={(event) => onDefaultCustomReminderValueChange(cleanReminderValue(event.target.value))}
                />
                <span className="wizard-custom-reminder-input-unit">{settings.reminders.defaultCustomReminderUnit}</span>
              </div>
            </label>
            <div className="wizard-custom-reminder-units" role="group" aria-label="Default custom reminder unit">
              {reminderUnits.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  className={`settings-choice-pill wizard-custom-reminder-unit${settings.reminders.defaultCustomReminderUnit === unit ? ' active' : ''}`}
                  aria-pressed={settings.reminders.defaultCustomReminderUnit === unit}
                  onClick={() => onDefaultCustomReminderUnitChange(unit)}
                >
                  {unit}
                </button>
              ))}
            </div>
            <div className="wizard-custom-reminder-preview" aria-live="polite">
              {customReminderPreview}
            </div>
            <p className="wizard-custom-reminder-note">Allowed range: 10 minutes to 30 days before delivery.</p>
            {customReminderError ? <span className="input-error-text">{customReminderError}</span> : null}
          </div>
        ) : null}
      </section>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Reminders & Notifications
      </button>
      {saved ? <p className="text-sm text-success">Reminders & Notifications saved.</p> : null}
    </div>
  )
}
