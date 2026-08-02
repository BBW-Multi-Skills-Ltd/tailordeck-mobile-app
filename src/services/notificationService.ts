import { supabase } from '../lib/supabase'
import type { AppNotification } from '../lib/notifications'
import { mapNotificationRow } from './mappers/notificationMapper'
import type { NotificationRow } from './types'
import { requireUserId } from './serviceHelpers'

export async function getNotifications(limit = 50): Promise<AppNotification[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<NotificationRow[]>()
  if (error) throw error
  return (data ?? []).map(mapNotificationRow)
}

export async function markRead(id: string): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).eq('id', id)
  if (error) throw error
}

export async function markAllRead(): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null)
  if (error) throw error
}

export async function deleteNotification(id: string): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('notifications').update({ deleted_at: new Date().toISOString() }).eq('user_id', userId).eq('id', id)
  if (error) throw error
}

export async function clearNotifications(): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('notifications').update({ deleted_at: new Date().toISOString() }).eq('user_id', userId).is('deleted_at', null)
  if (error) throw error
}
