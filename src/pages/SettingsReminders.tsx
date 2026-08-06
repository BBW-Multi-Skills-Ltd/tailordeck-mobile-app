import RemindersPanel from '../components/settings/RemindersPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import type { ReminderLead } from '../lib/settings'

export default function SettingsReminders() {
  const { actions, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Reminders"
        centered
        leading={<HistoryBackButton fallbackTo="/settings" />}
      />
      {state.settingsError ? <p className="inline-feedback-error" role="alert">{state.settingsError}</p> : null}

      <RemindersPanel
        settings={state.settings}
        saved={state.savedSection === 'Reminders' && Boolean(state.savedTick)}
        onPushNotificationsChange={(pushNotifications) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, pushNotifications } }))}
        onDefaultReminderChange={(defaultReminder: ReminderLead) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultReminder } }))}
        onSave={() => actions.markSaved('Reminders')}
      />
    </section>
  )
}
