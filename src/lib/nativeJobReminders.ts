import { Capacitor } from '@capacitor/core'
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications'
import type { PluginListenerHandle } from '@capacitor/core'
import type { JobReminderSchedule } from '../services/jobService'

const REMINDER_CHANNEL_ID = 'tailordeck-job-reminders'
const REMINDER_GROUP = 'tailordeck-job-reminders'
const REMINDER_ID_PREFIX = 420000000
const MAX_SCHEDULED_REMINDERS = 64

type NotificationTapHandler = (jobId: string) => void

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

function buildNotification(job: JobReminderSchedule): LocalNotificationSchema | null {
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
    isExactNotification: false,
    foreground: true,
    channelId: REMINDER_CHANNEL_ID,
    group: REMINDER_GROUP,
    extra: {
      source: 'tailordeck',
      type: 'job_reminder',
      jobId: job.id,
    },
  }
}

async function ensureNotificationChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return

  await LocalNotifications.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: 'Job reminders',
    description: 'Delivery deadline reminders from TailorDeck.',
    importance: 4,
    visibility: 1,
    lights: true,
    lightColor: '#7B1E37',
    vibration: true,
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

export async function clearNativeJobReminders(): Promise<void> {
  if (!isNativeNotificationsSupported()) return

  const ids = await getTailorDeckPendingIds()
  if (!ids.length) return
  await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) })
}

export async function syncNativeJobReminders(jobs: JobReminderSchedule[]): Promise<void> {
  if (!isNativeNotificationsSupported()) return

  const hasPermission = await getDisplayPermission(true)
  if (!hasPermission) {
    await clearNativeJobReminders()
    return
  }

  await ensureNotificationChannel()

  const nextNotifications = jobs
    .map(buildNotification)
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

export function registerNativeJobReminderTapHandler(onOpenJob: NotificationTapHandler): () => void {
  if (!isNativeNotificationsSupported()) return () => undefined

  let listener: PluginListenerHandle | null = null

  void LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    const extra = action.notification.extra as { source?: string; type?: string; jobId?: string } | undefined
    if (extra?.source !== 'tailordeck' || extra.type !== 'job_reminder' || !extra.jobId) return
    onOpenJob(extra.jobId)
  }).then((handle) => {
    listener = handle
  })

  return () => {
    void listener?.remove()
  }
}
