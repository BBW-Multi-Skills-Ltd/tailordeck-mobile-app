import { Capacitor } from '@capacitor/core'
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications'
import type { PluginListenerHandle } from '@capacitor/core'
import type { JobReminderSchedule } from '../services/jobService'

const REMINDER_NORMAL_CHANNEL_ID = 'tailordeck-job-reminders-normal-v1'
const REMINDER_STRONG_CHANNEL_ID = 'tailordeck-job-reminders-strong-v1'
const REMINDER_ALARM_CHANNEL_ID = 'tailordeck-job-reminders-alarm-v1'
const REMINDER_ACTION_TYPE_ID = 'tailordeck-job-reminder-actions'
const REMINDER_ACTION_OPEN = 'open_job'
const REMINDER_ACTION_COMPLETE = 'mark_completed'
const REMINDER_GROUP = 'tailordeck-job-reminders'
const REMINDER_SMALL_ICON = 'ic_stat_tailordeck'
const REMINDER_LARGE_ICON = 'ic_notification_tailordeck_large'
const REMINDER_SOUND = 'tailordeck_reminder.wav'
const REMINDER_ID_PREFIX = 420000000
const MAX_SCHEDULED_REMINDERS = 64

type NotificationActionHandlers = {
  onOpenJob: (jobId: string) => void
  onMarkJobCompleted: (jobId: string) => void | Promise<void>
}
type ExactAlarmPermission = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'

export type NativeReminderOptions = {
  ringtoneEnabled?: boolean
  exactAlarmEnabled?: boolean
}

export type NativeExactAlarmState = {
  supported: boolean
  permission: ExactAlarmPermission
}

function isNativeNotificationsSupported(): boolean {
  return Capacitor.isNativePlatform()
}

function getReminderMinutes(job: JobReminderSchedule): number | null {
  if (job.reminder === '1 day before') return 60 * 24
  if (job.reminder === '3 days before') return 60 * 24 * 3
  if (job.reminder === '1 week before') return 60 * 24 * 7
  if (job.reminder === 'custom') return job.custom_reminder_minutes
  return null
}

function getJobDeadline(job: JobReminderSchedule): Date | null {
  if (!job.deadline_date) return null

  const time = job.deadline_time?.slice(0, 5) || '09:00'
  const deadline = new Date(`${job.deadline_date}T${time}:00`)
  return Number.isNaN(deadline.getTime()) ? null : deadline
}

function getNotificationId(jobId: string): number {
  let hash = 0
  for (let index = 0; index < jobId.length; index += 1) {
    hash = (hash * 31 + jobId.charCodeAt(index)) >>> 0
  }
  return REMINDER_ID_PREFIX + (hash % 1000000000)
}

function formatReminderBody(job: JobReminderSchedule, deadline: Date): string {
  const service = job.title || job.item_type || 'Tailoring job'
  const client = job.client_name ? ` for ${job.client_name}` : ''
  const time = deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${service}${client} is due today at ${time}.`
}

function getReminderChannel(options: NativeReminderOptions, exactAlarmAllowed: boolean): string {
  if (options.exactAlarmEnabled && exactAlarmAllowed) return REMINDER_ALARM_CHANNEL_ID
  if (options.ringtoneEnabled) return REMINDER_STRONG_CHANNEL_ID
  return REMINDER_NORMAL_CHANNEL_ID
}

function buildNotification(job: JobReminderSchedule, options: NativeReminderOptions, exactAlarmAllowed: boolean): LocalNotificationSchema | null {
  const reminderMinutes = getReminderMinutes(job)
  const deadline = getJobDeadline(job)
  if (!reminderMinutes || !deadline) return null

  const scheduledAt = new Date(deadline.getTime() - reminderMinutes * 60 * 1000)
  if (scheduledAt.getTime() <= Date.now() + 5000) return null

  return {
    id: getNotificationId(job.id),
    title: 'TailorDeck reminder',
    body: formatReminderBody(job, deadline),
    largeBody: `${job.reminder_label || job.reminder} reminder. Open TailorDeck to view this job.`,
    schedule: {
      at: scheduledAt,
      allowWhileIdle: true,
    },
    isExactNotification: Boolean(options.exactAlarmEnabled && exactAlarmAllowed),
    isExactMandatory: false,
    foreground: true,
    autoCancel: true,
    sound: options.ringtoneEnabled ? REMINDER_SOUND : undefined,
    smallIcon: REMINDER_SMALL_ICON,
    largeIcon: REMINDER_LARGE_ICON,
    iconColor: '#7B1E37',
    channelId: getReminderChannel(options, exactAlarmAllowed),
    group: REMINDER_GROUP,
    actionTypeId: REMINDER_ACTION_TYPE_ID,
    extra: {
      source: 'tailordeck',
      type: 'job_reminder',
      jobId: job.id,
    },
  }
}

async function ensureNotificationChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return

  await Promise.all([
    LocalNotifications.createChannel({
      id: REMINDER_NORMAL_CHANNEL_ID,
      name: 'Job reminders',
      description: 'Delivery deadline reminders from TailorDeck.',
      importance: 3,
      visibility: 1,
      lights: true,
      lightColor: '#7B1E37',
      vibration: false,
    }),
    LocalNotifications.createChannel({
      id: REMINDER_STRONG_CHANNEL_ID,
      name: 'Job reminder alerts',
      description: 'Job deadline reminders with sound and vibration.',
      sound: REMINDER_SOUND,
      importance: 4,
      visibility: 1,
      lights: true,
      lightColor: '#7B1E37',
      vibration: true,
    }),
    LocalNotifications.createChannel({
      id: REMINDER_ALARM_CHANNEL_ID,
      name: 'Job deadline alarms',
      description: 'Exact job deadline alarms with stronger alerts.',
      sound: REMINDER_SOUND,
      importance: 5,
      visibility: 1,
      lights: true,
      lightColor: '#7B1E37',
      vibration: true,
    }),
  ])
}

async function registerReminderActions(): Promise<void> {
  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: REMINDER_ACTION_TYPE_ID,
        actions: [
          { id: REMINDER_ACTION_OPEN, title: 'View job' },
          { id: REMINDER_ACTION_COMPLETE, title: 'Mark completed' },
        ],
      },
    ],
  })
}

async function getDisplayPermission(requestIfNeeded: boolean): Promise<boolean> {
  const current = await LocalNotifications.checkPermissions()
  if (current.display === 'granted') return true
  if (!requestIfNeeded) return false

  const requested = await LocalNotifications.requestPermissions()
  return requested.display === 'granted'
}

async function getTailorDeckPendingIds(): Promise<number[]> {
  const pending = await LocalNotifications.getPending()
  return pending.notifications
    .filter((notification) => {
      const extra = notification.extra as { source?: string; type?: string } | undefined
      return extra?.source === 'tailordeck' && extra.type === 'job_reminder'
    })
    .map((notification) => notification.id)
}

function isExactAlarmSupported(): boolean {
  return isNativeNotificationsSupported() && Capacitor.getPlatform() === 'android'
}

export async function getNativeExactAlarmState(): Promise<NativeExactAlarmState> {
  if (!isExactAlarmSupported()) {
    return { supported: false, permission: 'denied' }
  }

  const state = await LocalNotifications.checkExactNotificationSetting()
  return { supported: true, permission: state.exact_alarm as ExactAlarmPermission }
}

export async function requestNativeExactAlarmPermission(): Promise<NativeExactAlarmState> {
  if (!isExactAlarmSupported()) {
    return { supported: false, permission: 'denied' }
  }

  const state = await LocalNotifications.changeExactNotificationSetting()
  return { supported: true, permission: state.exact_alarm as ExactAlarmPermission }
}

export async function clearNativeJobReminders(): Promise<void> {
  if (!isNativeNotificationsSupported()) return

  const ids = await getTailorDeckPendingIds()
  if (!ids.length) return
  await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) })
}

async function canScheduleExactAlarm(options: NativeReminderOptions): Promise<boolean> {
  if (!options.exactAlarmEnabled || !isExactAlarmSupported()) return false

  const state = await getNativeExactAlarmState()
  return state.permission === 'granted'
}

export async function syncNativeJobReminders(jobs: JobReminderSchedule[], options: NativeReminderOptions = {}): Promise<void> {
  if (!isNativeNotificationsSupported()) return

  const hasPermission = await getDisplayPermission(true)
  if (!hasPermission) {
    await clearNativeJobReminders()
    return
  }

  await ensureNotificationChannel()
  await registerReminderActions()

  const exactAlarmAllowed = await canScheduleExactAlarm(options)

  const nextNotifications = jobs
    .map((job) => buildNotification(job, options, exactAlarmAllowed))
    .filter((notification): notification is LocalNotificationSchema => Boolean(notification))
    .sort((first, second) => {
      const firstAt = first.schedule?.at?.getTime() ?? 0
      const secondAt = second.schedule?.at?.getTime() ?? 0
      return firstAt - secondAt
    })
    .slice(0, MAX_SCHEDULED_REMINDERS)

  const pendingIds = await getTailorDeckPendingIds()

  if (pendingIds.length) {
    await LocalNotifications.cancel({ notifications: pendingIds.map((id) => ({ id })) })
  }

  if (nextNotifications.length) {
    await LocalNotifications.schedule({ notifications: nextNotifications })
  }
}

export function registerNativeJobReminderTapHandler(handlers: NotificationActionHandlers): () => void {
  if (!isNativeNotificationsSupported()) return () => undefined

  let listener: PluginListenerHandle | null = null

  void LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    const extra = action.notification.extra as { source?: string; type?: string; jobId?: string } | undefined
    if (extra?.source !== 'tailordeck' || extra.type !== 'job_reminder' || !extra.jobId) return
    if (action.actionId === REMINDER_ACTION_COMPLETE) {
      void Promise.resolve(handlers.onMarkJobCompleted(extra.jobId)).catch((error) => {
        console.warn('Unable to mark TailorDeck reminder job completed:', error)
      })
      return
    }
    handlers.onOpenJob(extra.jobId)
  }).then((handle) => {
    listener = handle
  })

  return () => {
    void listener?.remove()
  }
}
