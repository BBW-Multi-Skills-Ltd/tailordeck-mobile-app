import type { DbNotificationType } from './commonRows'

export interface NotificationRow {
  id: string
  user_id: string
  type: DbNotificationType
  title: string
  message: string
  action_url: string | null
  read_at: string | null
  scheduled_for: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}
