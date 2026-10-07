import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'
import { corsHeadersForRequest, handleOptions, jsonResponse } from '../_shared/cors.ts'
import { enforceRateLimit, isRateLimitError } from '../_shared/rateLimit.ts'

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

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function adminClient() {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

function userClient(authHeader: string) {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  })
}

function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return map[char] ?? char
  })
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, request)
  }

  try {
    const authHeader = request.headers.get('Authorization') ?? ''
    if (!authHeader) return jsonResponse({ error: 'Missing authorization header' }, 401, request)

    const userSupabase = userClient(authHeader)
    const { data: userData, error: userError } = await userSupabase.auth.getUser()
    if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { ticketId, replyId } = await request.json()
    if (typeof ticketId !== 'string' || !ticketId) {
      return jsonResponse({ error: 'Missing ticket id' }, 400, request)
    }

    const admin = adminClient()
    await enforceRateLimit({
      action: 'support_ticket_notify',
      actorId: userData.user.id,
      admin,
      limit: 10,
      windowSeconds: 60 * 60,
    })

    const { data: ticket, error: ticketError } = await admin
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', userData.user.id)
      .maybeSingle<SupportTicket>()

    if (ticketError) throw ticketError
    if (!ticket) return jsonResponse({ error: 'Ticket not found' }, 404, request)

    const resendApiKey = requiredEnv('RESEND_API_KEY')
    const supportTo = Deno.env.get('SUPPORT_TO_EMAIL') || 'support@tailordeck.app'
    const from = Deno.env.get('RESEND_FROM_EMAIL') || 'TailorDeck Support <noreply@tailordeck.app>'
    const inboxLink = `https://tailordeck.app/admin/support/${ticket.id}`

    // Follow-up chat message from the user on an existing ticket.
    if (typeof replyId === 'string' && replyId) {
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
      const followUpResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [supportTo],
          subject: `[TailorDeck] New message on #${ticket.id.slice(0, 8).toUpperCase()}: ${ticket.subject}`,
          html: `
            <h2>New message from ${htmlEscape(ticket.account_email || userData.user.email || 'a user')}</h2>
            <p>${htmlEscape(reply.body || '(attachment only)').replace(/\n/g, '<br />')}</p>
            ${files.length ? `<p>📎 ${files.map(htmlEscape).join(', ')}</p>` : ''}
            <p><a href="${inboxLink}">Open the ticket in the support centre</a></p>
          `,
        }),
      })
      if (!followUpResponse.ok) throw new Error(`Resend email failed: ${await followUpResponse.text()}`)
      return jsonResponse({ ok: true }, 200, request)
    }

    const html = `
      <h2>New TailorDeck Support Ticket</h2>
      <p><strong>Ticket:</strong> ${htmlEscape(ticket.id)}</p>
      <p><strong>Category:</strong> ${htmlEscape(ticket.category)}</p>
      <p><strong>Priority:</strong> ${htmlEscape(ticket.priority)}</p>
      <p><strong>Subject:</strong> ${htmlEscape(ticket.subject)}</p>
      <p><strong>Account email:</strong> ${htmlEscape(ticket.account_email || userData.user.email || '-')}</p>
      <p><strong>Contact phone:</strong> ${htmlEscape(ticket.contact_phone || '-')}</p>
      <p><strong>Page:</strong> ${htmlEscape(ticket.page_url || '-')}</p>
      <hr />
      <p>${htmlEscape(ticket.message).replace(/\n/g, '<br />')}</p>
      <hr />
      <pre>${htmlEscape(JSON.stringify(ticket.device_info ?? {}, null, 2))}</pre>
      <p><a href="${inboxLink}">Open the ticket in the support centre</a></p>
      <hr />
      <p style="font-size:12px;color:#8B7A70;">TailorDeck is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.</p>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [supportTo],
        subject: `[TailorDeck] ${ticket.category}: ${ticket.subject}`,
        html,
      }),
    })

    if (!resendResponse.ok) {
      const text = await resendResponse.text()
      throw new Error(`Resend email failed: ${text}`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeadersForRequest(request), 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const status = isRateLimitError(error) ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to notify support.'
    return jsonResponse({ error: message }, status, request)
  }
})
