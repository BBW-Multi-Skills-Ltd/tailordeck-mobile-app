import { Toggle } from './SettingsRows'
import type { ReminderLead, TailorSettings } from '../../lib/settings'

type RemindersPanelProps = {
  settings: TailorSettings
  saved: boolean
  onPushNotificationsChange: (value: boolean) => void
  onDefaultReminderChange: (value: ReminderLead) => void
  onSave: () => void
}

export default function RemindersPanel({
  settings,
  saved,
  onPushNotificationsChange,
  onDefaultReminderChange,
  onSave,
}: RemindersPanelProps) {
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
          {(['1 day before', '3 days before', '1 week before'] as ReminderLead[]).map((reminder) => (
            <button key={reminder} type="button" className={`settings-choice-pill settings-reminder-chip${settings.reminders.defaultReminder === reminder ? ' active' : ''}`} onClick={() => onDefaultReminderChange(reminder)}>
              {reminder}
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Reminders & Notifications
      </button>
      {saved ? <p className="text-sm text-success">Reminders & Notifications saved.</p> : null}
    </div>
  )
}
