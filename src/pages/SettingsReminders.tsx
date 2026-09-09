import RemindersPanel from '../components/settings/RemindersPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { isCustomReminderValid } from '../lib/jobReminder'
import type { ReminderLead, ReminderUnit } from '../lib/settings'

export default function SettingsReminders() {
  const { actions, state } = useSettingsPage()
  const customReminderInvalid =
    state.settings.reminders.defaultReminder === 'custom' &&
    !isCustomReminderValid(state.settings.reminders.defaultCustomReminderValue, state.settings.reminders.defaultCustomReminderUnit)
  const customReminderError = customReminderInvalid ? 'Use 10 minutes to 30 days before delivery.' : ''

  function saveReminders(): void {
    if (customReminderInvalid) {
      actions.setSettingsError(customReminderError)
      return
    }
    void actions.markSaved('Reminders')
  }

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
        onDefaultCustomReminderValueChange={(defaultCustomReminderValue: string) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultCustomReminderValue } }))}
        onDefaultCustomReminderUnitChange={(defaultCustomReminderUnit: ReminderUnit) => actions.setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultCustomReminderUnit } }))}
        customReminderError={customReminderError}
        onSave={saveReminders}
      />
    </section>
  )
}
