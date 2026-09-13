import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContextCore'
import { clearNativeJobReminders, registerNativeJobReminderTapHandler, syncNativeJobReminders } from '../../lib/nativeJobReminders'
import { useJobReminderSchedulesQuery } from '../../hooks/useJobQueries'
import { useSettingsQuery } from '../../hooks/useSettingsQueries'

export default function NativeNotificationBridge() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    return registerNativeJobReminderTapHandler((jobId) => {
      navigate(`/jobs/${jobId}`)
    })
  }, [navigate])

  if (!user?.id) return null

  return <NativeNotificationSync />
}

function NativeNotificationSync() {
  const settingsQuery = useSettingsQuery()
  const pushNotificationsEnabled = Boolean(settingsQuery.data?.reminders.pushNotifications)
  const reminderJobsQuery = useJobReminderSchedulesQuery(pushNotificationsEnabled)

  useEffect(() => {
    if (!settingsQuery.data) return

    if (!pushNotificationsEnabled) {
      void clearNativeJobReminders().catch((error) => {
        console.warn('Unable to clear native reminders:', error)
      })
      return
    }

    if (!reminderJobsQuery.data) return

    void syncNativeJobReminders(reminderJobsQuery.data).catch((error) => {
      console.warn('Unable to sync native reminders:', error)
    })
  }, [pushNotificationsEnabled, reminderJobsQuery.data, settingsQuery.data])

  return null
}
