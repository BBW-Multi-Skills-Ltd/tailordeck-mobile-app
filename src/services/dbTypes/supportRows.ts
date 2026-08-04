import type { Json } from './commonRows'

export type SupportTicketCategory = 'billing' | 'bug' | 'feedback' | 'account' | 'general'
export type SupportTicketPriority = 'normal' | 'urgent'
export type SupportTicketStatus = 'open' | 'in_review' | 'resolved' | 'closed'

export interface SupportTicketRow {
  id: string
  user_id: string
  category: SupportTicketCategory
  priority: SupportTicketPriority
  status: SupportTicketStatus
  subject: string
  message: string
  account_email: string | null
  contact_phone: string | null
  page_url: string | null
  device_info: Json
  metadata: Json
  deleted_at: string | null
  created_at: string
  updated_at: string
}
