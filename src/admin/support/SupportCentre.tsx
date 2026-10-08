import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Inbox, Mail, Phone, RefreshCw, Store, User } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AttachmentList, ChatComposer } from '../../components/support/SupportChatParts'
import { useAttachmentLinks } from '../../components/support/useAttachmentLinks'
import { supabase } from '../../lib/supabase'
import { readSupportAttachments, uploadSupportAttachment, type SupportAttachment } from '../../lib/supportAttachments'
import {
  ADMIN_SUPPORT_STATUS_LABELS,
  formatSupportDate,
  SUPPORT_CATEGORY_LABELS,
  ticketNumber,
  type SupportStatus,
} from '../../lib/supportFormat'
import { getServiceErrorMessage } from '../../services/serviceHelpers'

// Support centre (/admin/support). Support admins read every ticket (RLS) and chat through the
// support-reply function: it pushes replies to the user's phone, and resolving/closing emails them the conversation.

type TicketStatus = SupportStatus

type Ticket = {
  id: string
  category: string
  priority: 'normal' | 'urgent'
  status: TicketStatus
  subject: string
  message: string
  account_email: string | null
  contact_phone: string | null
  device_info: Record<string, unknown> | null
  created_at: string
  last_reply_at: string | null
  last_message_by: 'support' | 'user' | null
}

type Contact = { full_name: string | null; shop_name: string | null }

type ChatMessage = { id: string; author_role: 'support' | 'user'; body: string; attachments: SupportAttachment[]; created_at: string }

type ReplyResult = { status: TicketStatus; pushed: number; emailed: boolean; transcriptEmailed: boolean; warning: string }

const STATUS_LABELS = ADMIN_SUPPORT_STATUS_LABELS
const CATEGORY_LABELS = SUPPORT_CATEGORY_LABELS

type Filter = 'active' | TicketStatus | 'all'

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'active', label: 'Needs attention' },
  { id: 'open', label: 'New' },
  { id: 'in_review', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
]

const TICKET_COLUMNS =
  'id,category,priority,status,subject,message,account_email,contact_phone,device_info,created_at,last_reply_at,last_message_by'

const isActive = (status: TicketStatus) => status === 'open' || status === 'in_review'
const awaitingSupport = (ticket: Ticket) => isActive(ticket.status) && (ticket.status === 'open' || ticket.last_message_by === 'user')

const errorMessage = getServiceErrorMessage
const formatDate = (value: string) => formatSupportDate(value)

function displayName(ticket: Ticket, contact?: Contact): string {
  return contact?.full_name || contact?.shop_name || ticket.account_email || 'TailorDeck user'
}

function StatusTag({ status }: { status: TicketStatus }) {
  return <span className={`ad-status ad-status-${status}`}>{STATUS_LABELS[status]}</span>
}

async function callSupportReply(body: Record<string, unknown>): Promise<ReplyResult> {
  const { data, error } = await supabase.functions.invoke<ReplyResult>('support-reply', { body })
  if (error || !data) throw error ?? new Error('Could not update the ticket.')
  return data
}

function TicketDetail({ ticket, contact, refreshKey, onChanged }: { ticket: Ticket; contact?: Contact; refreshKey: number; onChanged: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null)
  const [version, setVersion] = useState(0)
  const [sending, setSending] = useState(false)
  const [nextStatus, setNextStatus] = useState<'' | TicketStatus>('')
  const [status, setStatus] = useState<{ kind: 'error' | 'notice'; text: string } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const links = useAttachmentLinks((messages ?? []).flatMap((message) => message.attachments))

  useEffect(() => {
    let active = true
    void supabase
      .from('support_ticket_replies')
      .select('id,author_role,body,attachments,created_at')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (error) setStatus({ kind: 'error', text: errorMessage(error, 'Could not load the conversation.') })
        else setMessages((data ?? []).map((row) => ({ ...(row as ChatMessage), attachments: readSupportAttachments(row.attachments) })))
      })
    return () => {
      active = false
    }
  }, [ticket.id, version, refreshKey])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages?.length])

  function describe(result: ReplyResult, sentMessage: boolean): string {
    const parts: string[] = []
    if (sentMessage) {
      parts.push(result.pushed ? 'Sent. The user got a push notification.' : result.emailed ? 'Sent. The user has no push on their phone, so we emailed it.' : 'Sent in the app.')
    }
    if (result.transcriptEmailed) parts.push(`Marked ${STATUS_LABELS[result.status].toLowerCase()}; the user was emailed the full conversation.`)
    else if (!sentMessage) parts.push(`Marked ${STATUS_LABELS[result.status].toLowerCase()}.`)
    return parts.join(' ')
  }

  async function send(body: string, files: File[]): Promise<boolean> {
    setSending(true)
    setStatus(null)
    try {
      const attachments: SupportAttachment[] = []
      for (const file of files) attachments.push(await uploadSupportAttachment(ticket.id, file))
      const result = await callSupportReply({ ticketId: ticket.id, body, attachments, ...(nextStatus ? { status: nextStatus } : {}) })
      setStatus({ kind: result.warning ? 'error' : 'notice', text: result.warning || describe(result, true) })
      setNextStatus('')
      setVersion((current) => current + 1)
      onChanged()
      return true
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error, 'Could not send the message.') })
      return false
    } finally {
      setSending(false)
    }
  }

  async function changeStatus(next: TicketStatus) {
    if ((next === 'resolved' || next === 'closed') && !window.confirm(`Mark this ticket as ${STATUS_LABELS[next].toLowerCase()}? The chat closes and the user is emailed the full conversation.`)) return
    setSending(true)
    setStatus(null)
    try {
      const result = await callSupportReply({ ticketId: ticket.id, status: next })
      setStatus({ kind: result.warning ? 'error' : 'notice', text: result.warning || describe(result, false) })
      onChanged()
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error, 'Could not change the status.') })
    } finally {
      setSending(false)
    }
  }

  const device = ticket.device_info ?? {}
  const deviceSummary = [device.platform, device.language, device.viewportWidth && device.viewportHeight ? `${device.viewportWidth}×${device.viewportHeight}` : '']
    .filter(Boolean)
    .join(' · ')
  const active = isActive(ticket.status)

  return (
    <article className="ad-ticket mk-clay">
      <Link to="/admin/support" className="ad-back ad-ticket-back">
        <ArrowLeft size={16} /> All tickets
      </Link>
      <header className="ad-ticket-head">
        <div>
          <small className="ad-muted">
            {ticketNumber(ticket.id)} · {CATEGORY_LABELS[ticket.category] ?? ticket.category}
            {ticket.priority === 'urgent' ? ' · Urgent' : ''}
          </small>
          <h2>{ticket.subject}</h2>
        </div>
        <StatusTag status={ticket.status} />
      </header>

      <div className="ad-ticket-contact">
        {contact?.full_name ? (
          <span>
            <User size={14} /> {contact.full_name}
          </span>
        ) : null}
        {contact?.shop_name ? (
          <span>
            <Store size={14} /> {contact.shop_name}
          </span>
        ) : null}
        {ticket.account_email ? (
          <a href={`mailto:${ticket.account_email}`}>
            <Mail size={14} /> {ticket.account_email}
          </a>
        ) : null}
        {ticket.contact_phone ? (
          <a href={`tel:${ticket.contact_phone}`}>
            <Phone size={14} /> {ticket.contact_phone}
          </a>
        ) : null}
      </div>

      <div className="ad-thread">
        <div className="ad-bubble ad-bubble-user">
          <p>{ticket.message}</p>
          <small>
            {displayName(ticket, contact)} · {formatDate(ticket.created_at)}
          </small>
        </div>
        {messages === null ? <p className="ad-muted">Loading conversation…</p> : null}
        {messages?.map((message) => {
          const fromUser = message.author_role === 'user'
          return (
            <div key={message.id} className={`ad-bubble ${fromUser ? 'ad-bubble-user' : 'ad-bubble-support'}`}>
              {message.body ? <p>{message.body}</p> : null}
              <AttachmentList attachments={message.attachments} links={links} />
              <small>
                {fromUser ? displayName(ticket, contact) : 'Support'} · {formatDate(message.created_at)}
              </small>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {active ? (
        <div className="ad-reply">
          <ChatComposer sending={sending} placeholder="Reply to the user…" onSend={send} />
          <label className="ad-field ad-inline-field">
            After sending
            <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as '' | TicketStatus)}>
              <option value="">Keep the chat open</option>
              <option value="resolved">Mark resolved</option>
              <option value="closed">Mark closed</option>
            </select>
            <small className="ad-hint">Resolved or closed ends the chat and emails the user the full conversation.</small>
          </label>
        </div>
      ) : (
        <p className="ad-notice ad-closed-note">
          This chat is {STATUS_LABELS[ticket.status].toLowerCase()}. The user can start a new request from the app.
        </p>
      )}
      {status ? <p className={status.kind === 'error' ? 'ad-error' : 'ad-notice'}>{status.text}</p> : null}

      <div className="ad-status-actions">
        <span className="ad-muted">Change status:</span>
        {(Object.keys(STATUS_LABELS) as TicketStatus[])
          .filter((option) => option !== ticket.status)
          .map((option) => (
            <button key={option} type="button" className="ad-chip" disabled={sending} onClick={() => void changeStatus(option)}>
              {isActive(option) && !active ? `Reopen as ${STATUS_LABELS[option].toLowerCase()}` : STATUS_LABELS[option]}
            </button>
          ))}
      </div>

      {deviceSummary ? <p className="ad-device ad-muted">Device: {deviceSummary}</p> : null}
    </article>
  )
}

export default function SupportCentre() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [contacts, setContacts] = useState<Record<string, Contact>>({})
  const [filter, setFilter] = useState<Filter>('active')
  const [version, setVersion] = useState(0)
  const [chatVersion, setChatVersion] = useState(0)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    void supabase
      .from('support_tickets')
      .select(TICKET_COLUMNS)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(300)
      .then(async ({ data, error }) => {
        if (!active) return
        if (error) {
          setLoadError(errorMessage(error, 'Could not load tickets.'))
          return
        }
        const rows = (data ?? []) as unknown as Ticket[]
        setLoadError('')
        setTickets(rows)
        if (!rows.length) return
        const { data: contactRows } = await supabase.rpc('get_support_ticket_contacts', { ticket_ids: rows.map((row) => row.id) })
        if (!active || !Array.isArray(contactRows)) return
        setContacts(
          Object.fromEntries(
            (contactRows as Array<Contact & { ticket_id: string }>).map((row) => [row.ticket_id, { full_name: row.full_name, shop_name: row.shop_name }]),
          ),
        )
      })
    return () => {
      active = false
    }
  }, [version])

  // Live inbox: new tickets, new messages and status changes.
  useEffect(() => {
    const channel = supabase
      .channel('admin-support-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => setVersion((current) => current + 1))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_ticket_replies' }, () => setChatVersion((current) => current + 1))
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { active: 0, open: 0, in_review: 0, resolved: 0, closed: 0, all: 0 }
    for (const ticket of tickets ?? []) {
      result[ticket.status] += 1
      result.all += 1
      if (isActive(ticket.status)) result.active += 1
    }
    return result
  }, [tickets])

  const visible = (tickets ?? []).filter((ticket) =>
    filter === 'all' ? true : filter === 'active' ? isActive(ticket.status) : ticket.status === filter,
  )
  const selected = tickets?.find((ticket) => ticket.id === ticketId) ?? null

  return (
    <section className="ad-page">
      <Link to="/admin" className="ad-back">
        <ArrowLeft size={16} /> All areas
      </Link>
      <div className="ad-page-head">
        <h1>Support centre</h1>
        <button type="button" className="mk-btn mk-btn-secondary" onClick={() => setVersion((current) => current + 1)}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <p className="ad-muted ad-page-copy">Live chat with users. Replies reach their phone as a push notification.</p>

      <div className="ad-filters" role="tablist" aria-label="Ticket status">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={`ad-chip${filter === item.id ? ' is-active' : ''}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label} <b>{counts[item.id]}</b>
          </button>
        ))}
      </div>

      {loadError ? <p className="ad-error">{loadError}</p> : null}

      <div className={`ad-support-grid${ticketId ? ' has-selection' : ''}`}>
        <div className="ad-ticket-list mk-clay">
          {tickets === null ? (
            <p className="ad-muted ad-list-empty">Loading tickets…</p>
          ) : visible.length === 0 ? (
            <div className="ad-list-empty">
              <Inbox size={22} />
              <p className="ad-muted">No tickets here.</p>
            </div>
          ) : (
            <ul>
              {visible.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    className={`ad-ticket-row${ticket.id === ticketId ? ' is-selected' : ''}${awaitingSupport(ticket) ? ' is-unread' : ''}`}
                    onClick={() => navigate(`/admin/support/${ticket.id}`)}
                  >
                    <span className="ad-ticket-row-top">
                      <b>{displayName(ticket, contacts[ticket.id])}</b>
                      {awaitingSupport(ticket) ? <span className="ad-unread-dot" aria-label="Waiting for your reply" /> : null}
                      <StatusTag status={ticket.status} />
                    </span>
                    <span className="ad-ticket-row-subject">{ticket.subject}</span>
                    <span className="ad-ticket-row-message">{ticket.message}</span>
                    <small className="ad-muted">
                      {contacts[ticket.id]?.shop_name && contacts[ticket.id]?.full_name ? `${contacts[ticket.id]?.shop_name} · ` : ''}
                      {formatDate(ticket.last_reply_at ?? ticket.created_at)}
                      {ticket.priority === 'urgent' ? ' · Urgent' : ''}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ad-ticket-pane">
          {selected ? (
            <TicketDetail
              key={selected.id}
              ticket={selected}
              contact={contacts[selected.id]}
              refreshKey={chatVersion}
              onChanged={() => setVersion((current) => current + 1)}
            />
          ) : ticketId && tickets ? (
            <div className="ad-empty mk-clay">
              <p className="ad-muted">This ticket was not found.</p>
            </div>
          ) : (
            <div className="ad-empty mk-clay ad-pick">
              <Inbox size={26} />
              <p className="ad-muted">Choose a ticket to read it and reply.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
