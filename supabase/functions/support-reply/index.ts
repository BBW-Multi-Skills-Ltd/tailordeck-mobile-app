import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import { emailShell, htmlEscape, paragraphs, sendEmail, supportInbox } from '../_shared/email.ts'
import { sendPushToUser } from '../_shared/fcm.ts'
import { createServiceClient, getRequestUser, hasAdminRole, type ServiceClient } from '../_shared/supabase.ts'

// Support centre actions (/admin/support), only for admins with the 'support' role:
// - a chat message (text and/or attachments): saved, pushed to the user's phone and listed in their
//   in-app notifications; emailed only if the user has no device that can receive push.
// - a status change: resolving/closing the ticket ends the chat and emails the user the full conversation.

type Ticket = {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  account_email: string | null
  created_at: string
}

type Attachment = { path: string; name: string; type: string; size: number }
type Message = { author_role: 'support' | 'user'; body: string; attachments: Attachment[]; created_at: string }

const STATUSES = ['open', 'in_review', 'resolved', 'closed']
const ENDED = ['resolved', 'closed']
const MAX_BODY = 4000
const BUCKET = 'support-attachments'

const ticketNumber = (id: string) => id.slice(0, 8).toUpperCase()
const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

/** Emails the ticket owner; replies to the email go to the support inbox. */
async function sendUserEmail(to: string, subject: string, html: string): Promise<boolean> {
  return (await sendEmail({ to, subject, html, replyTo: supportInbox() })).ok
}

/** Attachments must be files already uploaded to this ticket's folder. */
async function validAttachments(admin: ServiceClient, ticketId: string, input: unknown): Promise<Attachment[] | null> {
  if (input === undefined || input === null) return []
  if (!Array.isArray(input) || input.length > 5) return null
  const files: Attachment[] = []
  for (const item of input) {
    const file = item as Partial<Attachment>
    if (typeof file?.path !== 'string' || !file.path.startsWith(`${ticketId}/`) || file.path.includes('..')) return null
    const fileName = file.path.slice(ticketId.length + 1)
    const { data } = await admin.storage.from(BUCKET).list(ticketId, { search: fileName, limit: 1 })
    if (!data?.some((object) => object.name === fileName)) return null
    files.push({
      path: file.path,
      name: typeof file.name === 'string' ? file.name.slice(0, 120) : fileName,
      type: typeof file.type === 'string' ? file.type.slice(0, 80) : '',
      size: typeof file.size === 'number' ? file.size : 0,
    })
  }
  return files
}

async function userEmail(admin: ServiceClient, ticket: Ticket): Promise<string> {
  const { data } = await admin.auth.admin.getUserById(ticket.user_id)
  return data?.user?.email || ticket.account_email || ''
}

function transcriptHtml(ticket: Ticket, messages: Message[], status: string): string {
  const rows = [
    { author: 'You', body: ticket.message, attachments: [] as Attachment[], at: ticket.created_at },
    ...messages.map((item) => ({ author: item.author_role === 'user' ? 'You' : 'TailorDeck support', body: item.body, attachments: item.attachments, at: item.created_at })),
  ]
  const items = rows
    .map((row) => {
      const files = row.attachments.length
        ? `<div style="font-size:12px;color:#8B7A70;margin-top:4px;">📎 ${row.attachments.map((file) => htmlEscape(file.name)).join(', ')}</div>`
        : ''
      const support = row.author !== 'You'
      return `
        <div style="margin:0 0 12px;padding:12px 14px;border-radius:12px;background:${support ? '#f6ecee' : '#f4f1ee'};">
          <div style="font-size:12px;font-weight:700;color:${support ? '#7B1E37' : '#6b5a50'};">${row.author} · ${htmlEscape(formatDate(row.at))}</div>
          ${row.body ? `<div style="margin-top:4px;">${paragraphs(row.body)}</div>` : ''}
          ${files}
        </div>`
    })
    .join('')
  return emailShell(
    status === 'closed' ? 'Your support request is closed' : 'Your support request is resolved',
    `
      <p>Here is the full conversation for request <strong>#${ticketNumber(ticket.id)}</strong> (${htmlEscape(ticket.subject)}), for your records.</p>
      ${items}
      <p style="font-size:14px;">Need more help? Open TailorDeck and go to <strong>Help &amp; Support</strong> to start a new request.</p>`,
  )
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, request)

  try {
    const admin = createServiceClient()
    const user = await getRequestUser(request, admin)
    if (!user) return jsonResponse({ error: 'Authentication required.' }, 401, request)
    if (!(await hasAdminRole(admin, request, user.id, 'support'))) {
      return jsonResponse({ error: 'Support admin access with two-step login required.' }, 403, request)
    }

    const input = (await request.json().catch(() => ({}))) as { ticketId?: unknown; body?: unknown; attachments?: unknown; status?: unknown }
    const ticketId = typeof input.ticketId === 'string' ? input.ticketId : ''
    const body = typeof input.body === 'string' ? input.body.trim() : ''
    const nextStatus = typeof input.status === 'string' && STATUSES.includes(input.status) ? input.status : ''
    if (!ticketId) return jsonResponse({ error: 'Missing ticket.' }, 400, request)
    if (body.length > MAX_BODY) return jsonResponse({ error: `Messages can be up to ${MAX_BODY} characters.` }, 400, request)

    const { data: ticket, error: ticketError } = await admin
      .from('support_tickets')
      .select('id,user_id,subject,message,status,account_email,created_at')
      .eq('id', ticketId)
      .is('deleted_at', null)
      .maybeSingle<Ticket>()
    if (ticketError) throw ticketError
    if (!ticket) return jsonResponse({ error: 'Ticket not found.' }, 404, request)

    const attachments = await validAttachments(admin, ticket.id, input.attachments)
    if (attachments === null) return jsonResponse({ error: 'An attachment could not be found. Please upload it again.' }, 400, request)
    const hasMessage = Boolean(body || attachments.length)
    if (!hasMessage && !nextStatus) return jsonResponse({ error: 'Write a message or choose a status.' }, 400, request)

    const link = `/help/requests/${ticket.id}`
    const result: { ok: true; status: string; pushed: number; emailed: boolean; transcriptEmailed: boolean; warning: string } = {
      ok: true,
      status: nextStatus || ticket.status,
      pushed: 0,
      emailed: false,
      transcriptEmailed: false,
      warning: '',
    }

    // 1. Chat message
    if (hasMessage) {
      const { data: reply, error: replyError } = await admin
        .from('support_ticket_replies')
        .insert({ ticket_id: ticket.id, author_id: user.id, author_role: 'support', body, attachments })
        .select('id,created_at')
        .single<{ id: string; created_at: string }>()
      if (replyError) throw replyError

      const update: Record<string, unknown> = { last_reply_at: reply.created_at, last_message_by: 'support' }
      // Answering a new ticket moves it to "in progress" unless a status was chosen.
      if (!nextStatus && ticket.status === 'open') update.status = 'in_review'
      const { error: updateError } = await admin.from('support_tickets').update(update).eq('id', ticket.id)
      if (updateError) throw updateError
      if (update.status) result.status = 'in_review'

      const preview = body ? (body.length > 140 ? `${body.slice(0, 137)}...` : body) : 'Sent you an attachment.'
      await admin.from('notifications').insert({ user_id: ticket.user_id, type: 'account', title: 'TailorDeck support replied', message: preview, action_url: link })

      try {
        result.pushed = await sendPushToUser(admin, ticket.user_id, { title: 'TailorDeck support replied', body: preview, data: { url: link } })
      } catch (error) {
        console.error('support push failed:', error instanceof Error ? error.message : error)
      }

      // No phone can receive push (old app or notifications off): email the message instead.
      if (!result.pushed) {
        const to = await userEmail(admin, ticket)
        if (to) {
          result.emailed = await sendUserEmail(
            to,
            `Re: ${ticket.subject} [#${ticketNumber(ticket.id)}]`,
            emailShell(
              'TailorDeck support replied',
              `<p>${body ? paragraphs(body) : 'We sent you an attachment.'}</p>
               ${attachments.length ? `<p style="font-size:13px;color:#8B7A70;">📎 ${attachments.map((file) => htmlEscape(file.name)).join(', ')} (open the app to view)</p>` : ''}
               <p style="font-size:14px;">Open TailorDeck and go to <strong>Help &amp; Support → My support requests</strong> to read and reply.</p>`,
            ),
          )
          if (result.emailed) await admin.from('support_ticket_replies').update({ emailed_at: new Date().toISOString() }).eq('id', reply.id)
        }
        if (!result.emailed) result.warning = 'Saved in the app, but no push or email could be delivered.'
      }
    }

    // 2. Status change
    if (nextStatus && nextStatus !== ticket.status) {
      const ending = ENDED.includes(nextStatus) && !ENDED.includes(ticket.status)
      const update: Record<string, unknown> = { status: nextStatus }
      if (!ENDED.includes(nextStatus)) update.transcript_emailed_at = null
      const { error: statusError } = await admin.from('support_tickets').update(update).eq('id', ticket.id)
      if (statusError) throw statusError
      result.status = nextStatus

      if (ending) {
        const label = nextStatus === 'closed' ? 'closed' : 'resolved'
        await admin.from('notifications').insert({
          user_id: ticket.user_id,
          type: 'account',
          title: `Support request ${label}`,
          message: `Request #${ticketNumber(ticket.id)} is ${label}. We emailed you the full conversation.`,
          action_url: link,
        })
        try {
          await sendPushToUser(admin, ticket.user_id, {
            title: `Support request ${label}`,
            body: `Request #${ticketNumber(ticket.id)} is ${label}. Thanks for contacting TailorDeck.`,
            data: { url: link },
          })
        } catch (error) {
          console.error('support push failed:', error instanceof Error ? error.message : error)
        }

        const { data: messages } = await admin
          .from('support_ticket_replies')
          .select('author_role,body,attachments,created_at')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true })
        const to = await userEmail(admin, ticket)
        if (to) {
          result.transcriptEmailed = await sendUserEmail(
            to,
            `Your TailorDeck support request #${ticketNumber(ticket.id)} is ${label}`,
            transcriptHtml(ticket, (messages ?? []) as Message[], nextStatus),
          )
          if (result.transcriptEmailed) await admin.from('support_tickets').update({ transcript_emailed_at: new Date().toISOString() }).eq('id', ticket.id)
        }
        if (!result.transcriptEmailed) result.warning = 'Status changed, but the summary email could not be sent.'
      }
    }

    return jsonResponse(result, 200, request)
  } catch (error) {
    console.error('support-reply failed:', error instanceof Error ? error.message : error)
    return jsonResponse({ error: 'Unable to update the ticket right now.' }, 500, request)
  }
})
