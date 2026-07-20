import RemindersPanel from '../components/settings/RemindersPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'
import type { NotificationBellOption, ReminderLead, RingtoneOption } from '../lib/settings'

export default function SettingsReminders() {
  const { actions, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader title="Reminders" centered />

      <article className="clay-card settings-standalone-card">
        <RemindersPanel
          settings={state.settings}
          saved={state.savedSection === 'Reminders' && Boolean(state.savedTick)}
          onPushNotificationsChange={(pushNotifications) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, pushNotifications } }))}
          onNotificationBellEnabledChange={(notificationBellEnabled) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBellEnabled } }))}
          onNotificationBellChange={(notificationBell: NotificationBellOption) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBell } }))}
          onDefaultReminderChange={(defaultReminder: ReminderLead) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultReminder } }))}
          onRingtoneEnabledChange={(ringtoneEnabled) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtoneEnabled } }))}
          onRingtoneChange={(ringtone: RingtoneOption) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtone } }))}
          onSave={() => actions.markSaved('Reminders')}
        />
      </article>
    </section>
  )
}
