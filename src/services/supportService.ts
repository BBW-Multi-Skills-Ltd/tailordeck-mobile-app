import { supabase } from '../lib/supabase'
import { getFunctionInvokeErrorMessage, requireUserId, ServiceError } from './serviceHelpers'
import type { SupportTicketCategory, SupportTicketPriority, SupportTicketRow } from './types'

const SUPPORT_TICKET_LIMIT = 5
const SUPPORT_TICKET_WINDOW_SECONDS = 60 * 60

export type CreateSupportTicketInput = {
  category: SupportTicketCategory
  priority?: SupportTicketPriority
  subject: string
  message: string
  accountEmail?: string
  contactPhone?: string
  metadata?: Record<string, unknown>
}

export type SupportTicketCooldown = {
  limited: boolean
  recentCount: number
  remaining: number
  waitSeconds: number
  nextAvailableAt: string | null
}

export async function getSupportTicketCooldown(): Promise<SupportTicketCooldown> {
  const userId = await requireUserId()
  const now = new Date()
  const cutoff = new Date(now.getTime() - SUPPORT_TICKET_WINDOW_SECONDS * 1000).toISOString()

  const { data, error } = await supabase
    .from('support_tickets')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(SUPPORT_TICKET_LIMIT)

  if (error) throw error

  const recentTickets = data ?? []
  const limited = recentTickets.length >= SUPPORT_TICKET_LIMIT

  if (!limited) {
    return {
      limited: false,
      recentCount: recentTickets.length,
      remaining: SUPPORT_TICKET_LIMIT - recentTickets.length,
      waitSeconds: 0,
      nextAvailableAt: null,
    }
  }

  const oldestTicketTime = new Date(recentTickets[0].created_at).getTime()
  const nextAvailableTime = oldestTicketTime + SUPPORT_TICKET_WINDOW_SECONDS * 1000
  const waitSeconds = Math.max(1, Math.ceil((nextAvailableTime - now.getTime()) / 1000))

  return {
    limited: true,
    recentCount: recentTickets.length,
    remaining: 0,
    waitSeconds,
    nextAvailableAt: new Date(nextAvailableTime).toISOString(),
  }
}

export async function createSupportTicket(input: CreateSupportTicketInput): Promise<SupportTicketRow> {
  const cooldown = await getSupportTicketCooldown()
  if (cooldown.limited) {
    throw new ServiceError(`Please wait ${formatSupportCooldown(cooldown.waitSeconds)} before sending another request.`)
  }

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

  try {
    await notifySupportTeam(data.id)
  } catch (notifyError) {
    console.warn('Support ticket was saved, but email notification failed:', notifyError)
  }

  return data
}

async function notifySupportTeam(ticketId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('support-ticket-notify', {
    body: { ticketId },
  })
  if (error) {
    throw new ServiceError(await getFunctionInvokeErrorMessage(error, 'Unable to notify support.'))
  }
}

export function formatSupportCooldown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  if (minutes <= 0) return `${seconds}s`
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
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
