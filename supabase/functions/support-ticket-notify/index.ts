import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import { htmlEscape, paragraphs, sendEmail, supportInbox } from '../_shared/email.ts'
import { enforceRateLimit, isRateLimitError } from '../_shared/rateLimit.ts'
import { createServiceClient, getRequestUser } from '../_shared/supabase.ts'

// Emails the support inbox when a user opens a ticket, or (with replyId) sends a follow-up chat message.

type SupportTicket = {
  id: string
  user_id: string
  category: string
  priority: string
  subject: string
  message: string
  account_email: string | null
  contact_phone: string | null
  page_url: string | null
  device_info: Record<string, unknown>
  created_at: string
}

const BRAND_FOOTER = 'TailorDeck is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.'

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, request)
  }

  try {
    const admin = createServiceClient()
    const user = await getRequestUser(request, admin)
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { ticketId, replyId } = await request.json()
    if (typeof ticketId !== 'string' || !ticketId) {
      return jsonResponse({ error: 'Missing ticket id' }, 400, request)
    }

    // New tickets and chat messages have separate limits, so an active conversation never stops the
    // ticket emails (or the reverse). A chat can easily pass 10 messages an hour.
    const isChatMessage = typeof replyId === 'string' && replyId.length > 0
    await enforceRateLimit({
      action: isChatMessage ? 'support_message_notify' : 'support_ticket_notify',
      actorId: user.id,
      admin,
      limit: isChatMessage ? 60 : 10,
      windowSeconds: 60 * 60,
    })

    const { data: ticket, error: ticketError } = await admin
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .maybeSingle<SupportTicket>()

    if (ticketError) throw ticketError
    if (!ticket) return jsonResponse({ error: 'Ticket not found' }, 404, request)

    const inboxLink = `https://tailordeck.app/admin/support/${ticket.id}`
    const fromAddress = htmlEscape(ticket.account_email || user.email || 'a user')

    // Follow-up chat message from the user on an existing ticket.
    if (isChatMessage) {
      const { data: reply, error: replyError } = await admin
        .from('support_ticket_replies')
        .select('body,attachments,author_role')
        .eq('id', replyId)
        .eq('ticket_id', ticket.id)
        .eq('author_role', 'user')
        .maybeSingle<{ body: string; attachments: Array<{ name?: string }> }>()
      if (replyError) throw replyError
      if (!reply) return jsonResponse({ error: 'Message not found' }, 404, request)
      const files = (reply.attachments ?? []).map((file) => file.name ?? 'file')
      const sent = await sendEmail({
        to: supportInbox(),
        subject: `[TailorDeck] New message on #${ticket.id.slice(0, 8).toUpperCase()}: ${ticket.subject}`,
        html: `
          <h2>New message from ${fromAddress}</h2>
          <p>${paragraphs(reply.body || '(attachment only)')}</p>
          ${files.length ? `<p>📎 ${files.map(htmlEscape).join(', ')}</p>` : ''}
          <p><a href="${inboxLink}">Open the ticket in the support centre</a></p>
        `,
      })
      if (!sent.ok) throw new Error(`Resend email failed: ${sent.detail}`)
      return jsonResponse({ ok: true }, 200, request)
    }

    const html = `
      <h2>New TailorDeck Support Ticket</h2>
      <p><strong>Ticket:</strong> ${htmlEscape(ticket.id)}</p>
      <p><strong>Category:</strong> ${htmlEscape(ticket.category)}</p>
      <p><strong>Priority:</strong> ${htmlEscape(ticket.priority)}</p>
      <p><strong>Subject:</strong> ${htmlEscape(ticket.subject)}</p>
      <p><strong>Account email:</strong> ${htmlEscape(ticket.account_email || user.email || '-')}</p>
      <p><strong>Contact phone:</strong> ${htmlEscape(ticket.contact_phone || '-')}</p>
      <p><strong>Page:</strong> ${htmlEscape(ticket.page_url || '-')}</p>
      <hr />
      <p>${paragraphs(ticket.message)}</p>
      <hr />
      <pre>${htmlEscape(JSON.stringify(ticket.device_info ?? {}, null, 2))}</pre>
      <p><a href="${inboxLink}">Open the ticket in the support centre</a></p>
      <hr />
      <p style="font-size:12px;color:#8B7A70;">${BRAND_FOOTER}</p>
    `

    const sent = await sendEmail({ to: supportInbox(), subject: `[TailorDeck] ${ticket.category}: ${ticket.subject}`, html })
    if (!sent.ok) throw new Error(`Resend email failed: ${sent.detail}`)

    return jsonResponse({ ok: true }, 200, request)
  } catch (error) {
    const status = isRateLimitError(error) ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to notify support.'
    return jsonResponse({ error: message }, status, request)
  }
})
