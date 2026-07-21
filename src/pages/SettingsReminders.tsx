import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import RemindersPanel from '../components/settings/RemindersPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'
import type { ReminderLead } from '../lib/settings'

export default function SettingsReminders() {
  const navigate = useNavigate()
  const { actions, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Reminders"
        centered
        leading={(
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Back to settings" onClick={() => navigate('/settings')}>
            <ArrowLeft size={20} />
          </button>
        )}
      />

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
