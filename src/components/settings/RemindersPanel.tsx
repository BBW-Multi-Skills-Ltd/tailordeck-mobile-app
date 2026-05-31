import { notificationBellOptions, ringtoneOptions } from './settingsOptions'
import { Toggle } from './SettingsRows'
import type { NotificationBellOption, ReminderLead, RingtoneOption, TailorSettings } from '../../lib/settings'

type RemindersPanelProps = {
  settings: TailorSettings
  saved: boolean
  onPushNotificationsChange: (value: boolean) => void
  onNotificationBellEnabledChange: (value: boolean) => void
  onNotificationBellChange: (value: NotificationBellOption) => void
  onDefaultReminderChange: (value: ReminderLead) => void
  onRingtoneEnabledChange: (value: boolean) => void
  onRingtoneChange: (value: RingtoneOption) => void
  onSave: () => void
}

export default function RemindersPanel({
  settings,
  saved,
  onPushNotificationsChange,
  onNotificationBellEnabledChange,
  onNotificationBellChange,
  onDefaultReminderChange,
  onRingtoneEnabledChange,
  onRingtoneChange,
  onSave,
}: RemindersPanelProps) {
  return (
    <div className="stack settings-reminder-form">
      <div className="row-between settings-reminder-row">
        <div className="stack gap-4">
          <p className="settings-reminder-label">Push Notifications</p>
          <p className="settings-reminder-help">Phone pop-up alerts for deadlines and updates.</p>
        </div>
        <Toggle checked={settings.reminders.pushNotifications} onChange={onPushNotificationsChange} />
      </div>

      <div className="stack settings-reminder-group">
        <div className="row-between settings-reminder-row">
          <div className="stack gap-4">
            <p className="settings-reminder-label">Notification Bell Sound</p>
            <p className="settings-reminder-help">Choose the alert bell tone for phone notifications.</p>
          </div>
          <Toggle checked={settings.reminders.notificationBellEnabled} onChange={onNotificationBellEnabledChange} />
        </div>
        <div className="settings-radio-list">
          {notificationBellOptions.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`settings-radio-option${settings.reminders.notificationBell === value ? ' active' : ''}`}
              onClick={() => onNotificationBellChange(value)}
              disabled={!settings.reminders.pushNotifications || !settings.reminders.notificationBellEnabled}
            >
              <span className="settings-radio-indicator" />
              <Icon size={16} className="settings-radio-icon" />
              <span className="settings-radio-title">{value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stack settings-reminder-group">
        <p className="settings-reminder-label">Default Reminder</p>
        <p className="settings-help-text">How early we notify the tailor before delivery deadline.</p>
        <div className="settings-radio-list">
          {(['1 day before', '3 days before', '1 week before'] as ReminderLead[]).map((reminder) => (
            <button key={reminder} type="button" className={`settings-radio-option${settings.reminders.defaultReminder === reminder ? ' active' : ''}`} onClick={() => onDefaultReminderChange(reminder)}>
              <span className="settings-radio-indicator" />
              <span className="settings-radio-title">{reminder}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stack settings-reminder-group">
        <div className="row-between settings-reminder-row">
          <div className="stack gap-4">
            <p className="settings-reminder-label">Ringtone</p>
            <p className="settings-reminder-help">Play sound when a reminder alert is delivered.</p>
          </div>
          <Toggle checked={settings.reminders.ringtoneEnabled} onChange={onRingtoneEnabledChange} />
        </div>
        <div className="settings-radio-list">
          {ringtoneOptions.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`settings-radio-option${settings.reminders.ringtone === value ? ' active' : ''}`}
              onClick={() => onRingtoneChange(value)}
              disabled={!settings.reminders.pushNotifications || !settings.reminders.ringtoneEnabled}
            >
              <span className="settings-radio-indicator" />
              <Icon size={16} className="settings-radio-icon" />
              <span className="settings-radio-title">{value}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Reminders & Notifications
      </button>
      {saved ? <p className="text-sm text-success">Reminders & Notifications saved.</p> : null}
    </div>
  )
}
