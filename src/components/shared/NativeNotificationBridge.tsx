import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContextCore'
import { clearNativeJobReminders, registerNativeJobReminderTapHandler, syncNativeJobReminders } from '../../lib/nativeJobReminders'
import { registerPushHandlers, registerPushIfPermitted } from '../../lib/pushNotifications'
import { useJobReminderSchedulesQuery } from '../../hooks/useJobQueries'
import { useSettingsQuery } from '../../hooks/useSettingsQueries'
import { updateJobStatus } from '../../services/jobService'
import { queryKeys } from '../../hooks/queryKeys'

export default function NativeNotificationBridge() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    return registerNativeJobReminderTapHandler({
      onOpenJob: (jobId) => {
        navigate(`/jobs/${jobId}`)
      },
      onMarkJobCompleted: async (jobId) => {
        await updateJobStatus(jobId, 'Completed')
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['jobs'] }),
          queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.homeSummary }),
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthly'] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'status'] }),
          queryClient.invalidateQueries({ queryKey: queryKeys.jobReminderSchedules }),
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
        ])
        navigate(`/jobs/${jobId}`)
      },
    })
  }, [navigate, queryClient])

  // Support replies (Firebase push): tapping opens the chat; while the app is open, refresh it.
  useEffect(() => {
    return registerPushHandlers({
      onOpen: (url) => navigate(url),
      onReceived: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets })
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
      },
    })
  }, [navigate, queryClient])

  useEffect(() => {
    if (!user?.id) return
    void registerPushIfPermitted().catch((error) => {
      console.warn('Unable to register for push notifications:', error)
    })
  }, [user?.id])

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

    void syncNativeJobReminders(reminderJobsQuery.data, {
      ringtoneEnabled: settingsQuery.data.reminders.ringtoneEnabled,
      exactAlarmEnabled: settingsQuery.data.reminders.exactAlarmEnabled,
    }).catch((error) => {
      console.warn('Unable to sync native reminders:', error)
    })
  }, [pushNotificationsEnabled, reminderJobsQuery.data, settingsQuery.data])

  return null
}
