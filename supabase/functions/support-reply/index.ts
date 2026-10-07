import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'
import { handleOptions, jsonResponse } from '../_shared/cors.ts'

// Support centre reply (/admin/support), only for admins with the 'support' role.
// Saves the reply, updates the ticket status, adds an in-app notification and emails the user.
// The email's Reply-To is the support inbox, so the user can answer by email too.

type Ticket = {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  account_email: string | null
  created_at: string
}

const STATUSES = ['open', 'in_review', 'resolved', 'closed']
const MAX_BODY = 4000

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] ?? char)
}

const paragraphs = (value: string) => htmlEscape(value).replace(/\n/g, '<br />')

function ticketNumber(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, request)

  try {
    const header = request.headers.get('authorization') ?? ''
    const accessToken = header.toLowerCase().startsWith('bearer ') ? header.slice('bearer '.length).trim() : ''
    if (!accessToken) return jsonResponse({ error: 'Authentication required.' }, 401, request)

    const admin = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: userData, error: userError } = await admin.auth.getUser(accessToken)
    if (userError || !userData.user) return jsonResponse({ error: 'Authentication required.' }, 401, request)

    const { data: adminRow, error: adminError } = await admin.from('admin_users').select('roles').eq('user_id', userData.user.id).maybeSingle()
    if (adminError) throw adminError
    const roles = (adminRow as { roles: string[] } | null)?.roles ?? []
    if (!roles.includes('support')) return jsonResponse({ error: 'Support admin access required.' }, 403, request)

    const input = (await request.json().catch(() => ({}))) as { ticketId?: unknown; body?: unknown; status?: unknown }
    const ticketId = typeof input.ticketId === 'string' ? input.ticketId : ''
    const body = typeof input.body === 'string' ? input.body.trim() : ''
    const status = typeof input.status === 'string' && STATUSES.includes(input.status) ? input.status : 'in_review'
    if (!ticketId) return jsonResponse({ error: 'Missing ticket.' }, 400, request)
    if (!body || body.length > MAX_BODY) return jsonResponse({ error: `Write a reply (up to ${MAX_BODY} characters).` }, 400, request)

    const { data: ticket, error: ticketError } = await admin
      .from('support_tickets')
      .select('id,user_id,subject,message,status,account_email,created_at')
      .eq('id', ticketId)
      .is('deleted_at', null)
      .maybeSingle<Ticket>()
    if (ticketError) throw ticketError
    if (!ticket) return jsonResponse({ error: 'Ticket not found.' }, 404, request)

    const { data: reply, error: replyError } = await admin
      .from('support_ticket_replies')
      .insert({ ticket_id: ticket.id, author_id: userData.user.id, body })
      .select('id,created_at')
      .single<{ id: string; created_at: string }>()
    if (replyError) throw replyError

    const { error: statusError } = await admin
      .from('support_tickets')
      .update({ status, last_reply_at: reply.created_at })
      .eq('id', ticket.id)
    if (statusError) throw statusError

    // In-app: notification that opens the ticket screen.
    const preview = body.length > 140 ? `${body.slice(0, 137)}...` : body
    const { error: notificationError } = await admin.from('notifications').insert({
      user_id: ticket.user_id,
      type: 'account',
      title: 'TailorDeck support replied',
      message: preview,
      action_url: `/help/requests/${ticket.id}`,
    })
    if (notificationError) console.error('support-reply notification failed:', notificationError.message)

    // Email: the account's sign-in email first, then the email saved on the ticket.
    let emailed = false
    let emailError = ''
    const { data: owner } = await admin.auth.admin.getUserById(ticket.user_id)
    const to = owner?.user?.email || ticket.account_email || ''
    if (!to) {
      emailError = 'No email address on this account.'
    } else {
      const supportInbox = Deno.env.get('SUPPORT_TO_EMAIL') || 'support@tailordeck.app'
      const from = Deno.env.get('RESEND_FROM_EMAIL') || 'TailorDeck Support <noreply@tailordeck.app>'
      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f241f;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#7B1E37;margin:0 0 12px;">We replied to your support request</h2>
          <p>${paragraphs(body)}</p>
          <div style="margin:20px 0;padding:14px 16px;border-left:3px solid #e6d9cf;background:#faf6f2;color:#6b5a50;font-size:14px;">
            <strong>Your request #${ticketNumber(ticket.id)}:</strong><br />${paragraphs(ticket.message)}
          </div>
          <p style="font-size:14px;">You can also read this reply in the TailorDeck app under <strong>Help &amp; Support → My support requests</strong>. To answer, just reply to this email.</p>
          <p style="font-size:12px;color:#8B7A70;margin-top:20px;">TailorDeck is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.</p>
        </div>
      `
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${requiredEnv('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: supportInbox,
          subject: `Re: ${ticket.subject} [#${ticketNumber(ticket.id)}]`,
          html,
        }),
      })
      if (resendResponse.ok) {
        emailed = true
        await admin.from('support_ticket_replies').update({ emailed_at: new Date().toISOString() }).eq('id', reply.id)
      } else {
        emailError = 'The reply was saved and shown in the app, but the email could not be sent.'
        console.error('support-reply email failed:', resendResponse.status, await resendResponse.text())
      }
    }

    return jsonResponse({ ok: true, replyId: reply.id, status, emailed, emailError }, 200, request)
  } catch (error) {
    console.error('support-reply failed:', error instanceof Error ? error.message : error)
    return jsonResponse({ error: 'Unable to send the reply right now.' }, 500, request)
  }
})
