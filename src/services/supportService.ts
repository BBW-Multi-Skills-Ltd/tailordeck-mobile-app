import { supabase } from '../lib/supabase'
import { requireUserId } from './serviceHelpers'
import type { SupportTicketCategory, SupportTicketPriority, SupportTicketRow } from './types'

export type CreateSupportTicketInput = {
  category: SupportTicketCategory
  priority?: SupportTicketPriority
  subject: string
  message: string
  accountEmail?: string
  contactPhone?: string
  metadata?: Record<string, unknown>
}

export async function createSupportTicket(input: CreateSupportTicketInput): Promise<SupportTicketRow> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      category: input.category,
      priority: input.priority ?? 'normal',
      subject: input.subject.trim(),
      message: input.message.trim(),
      account_email: input.accountEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      page_url: currentPageUrl(),
      device_info: collectDeviceInfo(),
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single<SupportTicketRow>()

  if (error) throw error

  notifySupportTeam(data.id).catch((notifyError) => {
    console.warn('Support ticket was saved, but email notification failed:', notifyError)
  })

  return data
}

async function notifySupportTeam(ticketId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('support-ticket-notify', {
    body: { ticketId },
  })
  if (error) throw error
}

function currentPageUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

function collectDeviceInfo(): Record<string, string | number | boolean> {
  if (typeof window === 'undefined') return {}

  return {
    userAgent: window.navigator.userAgent,
    language: window.navigator.language,
    platform: window.navigator.platform,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    online: window.navigator.onLine,
  }
}
