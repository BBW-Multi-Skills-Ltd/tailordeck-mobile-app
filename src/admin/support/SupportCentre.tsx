import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Inbox, Mail, Phone, RefreshCw, Send } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// Support centre (/admin/support). Support admins read every ticket (RLS) and reply through the
// support-reply function, which saves the reply, notifies the user in the app and emails them.

type TicketStatus = 'open' | 'in_review' | 'resolved' | 'closed'

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
}

type Reply = { id: string; body: string; emailed_at: string | null; created_at: string }

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'New',
  in_review: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const CATEGORY_LABELS: Record<string, string> = {
  billing: 'Billing',
  bug: 'Bug report',
  feedback: 'Feedback',
  account: 'Account',
  general: 'General',
}

type Filter = 'active' | TicketStatus | 'all'

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'active', label: 'Needs attention' },
  { id: 'open', label: 'New' },
  { id: 'in_review', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
]

const TICKET_COLUMNS = 'id,category,priority,status,subject,message,account_email,contact_phone,device_info,created_at,last_reply_at'

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message) return error.message
  return fallback
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const ticketNumber = (id: string) => `#${id.slice(0, 8).toUpperCase()}`

function StatusTag({ status }: { status: TicketStatus }) {
  return <span className={`ad-status ad-status-${status}`}>{STATUS_LABELS[status]}</span>
}

function TicketDetail({ ticket, onChanged }: { ticket: Ticket; onChanged: () => void }) {
  const [replies, setReplies] = useState<Reply[] | null>(null)
  const [version, setVersion] = useState(0)
  const [body, setBody] = useState('')
  const [nextStatus, setNextStatus] = useState<TicketStatus>('resolved')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'error' | 'notice'; text: string } | null>(null)

  useEffect(() => {
    let active = true
    void supabase
      .from('support_ticket_replies')
      .select('id,body,emailed_at,created_at')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (error) setStatus({ kind: 'error', text: errorMessage(error, 'Could not load replies.') })
        else setReplies((data ?? []) as Reply[])
      })
    return () => {
      active = false
    }
  }, [ticket.id, version])

  async function sendReply(event: FormEvent) {
    event.preventDefault()
    if (!body.trim()) {
      setStatus({ kind: 'error', text: 'Write a reply first.' })
      return
    }
    setSending(true)
    setStatus(null)
    const { data, error } = await supabase.functions.invoke<{ emailed: boolean; emailError: string }>('support-reply', {
      body: { ticketId: ticket.id, body: body.trim(), status: nextStatus },
    })
    setSending(false)
    if (error || !data) {
      setStatus({ kind: 'error', text: errorMessage(error, 'Could not send the reply.') })
      return
    }
    setBody('')
    setStatus(
      data.emailed
        ? { kind: 'notice', text: 'Reply sent. The user got an email and an in-app notification.' }
        : { kind: 'error', text: data.emailError || 'Reply saved in the app, but the email was not sent.' },
    )
    setVersion((current) => current + 1)
    onChanged()
  }

  async function changeStatus(next: TicketStatus) {
    const { error } = await supabase.from('support_tickets').update({ status: next }).eq('id', ticket.id)
    if (error) setStatus({ kind: 'error', text: errorMessage(error, 'Could not change the status.') })
    else onChanged()
  }

  const device = ticket.device_info ?? {}
  const deviceSummary = [device.platform, device.language, device.viewportWidth && device.viewportHeight ? `${device.viewportWidth}×${device.viewportHeight}` : '']
    .filter(Boolean)
    .join(' · ')

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
        <span className="ad-muted">{formatDate(ticket.created_at)}</span>
      </div>

      <div className="ad-thread">
        <div className="ad-bubble ad-bubble-user">
          <p>{ticket.message}</p>
          <small>User · {formatDate(ticket.created_at)}</small>
        </div>
        {replies === null ? <p className="ad-muted">Loading replies…</p> : null}
        {replies?.map((reply) => (
          <div key={reply.id} className="ad-bubble ad-bubble-support">
            <p>{reply.body}</p>
            <small>
              Support · {formatDate(reply.created_at)} · {reply.emailed_at ? 'emailed' : 'in app only'}
            </small>
          </div>
        ))}
      </div>

      <form className="ad-reply" onSubmit={sendReply}>
        <label className="ad-field">
          Reply to the user
          <span className="ad-input-wrap ad-input-multiline">
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} maxLength={4000} placeholder="Write your reply…" />
          </span>
          <small className="ad-hint">Sent by email (they can reply to it) and shown in the app under My support requests.</small>
        </label>
        <div className="ad-reply-actions">
          <label className="ad-field ad-inline-field">
            Then mark as
            <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as TicketStatus)}>
              <option value="in_review">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <button type="submit" className="mk-btn mk-btn-primary" disabled={sending}>
            <Send size={16} /> {sending ? 'Sending…' : 'Send reply'}
          </button>
        </div>
        {status ? <p className={status.kind === 'error' ? 'ad-error' : 'ad-notice'}>{status.text}</p> : null}
      </form>

      <div className="ad-status-actions">
        <span className="ad-muted">Change status without replying:</span>
        {(Object.keys(STATUS_LABELS) as TicketStatus[])
          .filter((option) => option !== ticket.status)
          .map((option) => (
            <button key={option} type="button" className="ad-chip" onClick={() => void changeStatus(option)}>
              {STATUS_LABELS[option]}
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
  const [filter, setFilter] = useState<Filter>('active')
  const [version, setVersion] = useState(0)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    void supabase
      .from('support_tickets')
      .select(TICKET_COLUMNS)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data, error }) => {
        if (!active) return
        if (error) setLoadError(errorMessage(error, 'Could not load tickets.'))
        else {
          setLoadError('')
          setTickets((data ?? []) as unknown as Ticket[])
        }
      })
    return () => {
      active = false
    }
  }, [version])

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { active: 0, open: 0, in_review: 0, resolved: 0, closed: 0, all: 0 }
    for (const ticket of tickets ?? []) {
      result[ticket.status] += 1
      result.all += 1
      if (ticket.status === 'open' || ticket.status === 'in_review') result.active += 1
    }
    return result
  }, [tickets])

  const visible = (tickets ?? []).filter((ticket) =>
    filter === 'all' ? true : filter === 'active' ? ticket.status === 'open' || ticket.status === 'in_review' : ticket.status === filter,
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
      <p className="ad-muted ad-page-copy">Help requests sent from the app. Replies reach the user by email and in the app.</p>

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
                    className={`ad-ticket-row${ticket.id === ticketId ? ' is-selected' : ''}`}
                    onClick={() => navigate(`/admin/support/${ticket.id}`)}
                  >
                    <span className="ad-ticket-row-top">
                      <b>{ticket.subject}</b>
                      <StatusTag status={ticket.status} />
                    </span>
                    <span className="ad-ticket-row-message">{ticket.message}</span>
                    <small className="ad-muted">
                      {ticket.account_email || 'No email'} · {formatDate(ticket.created_at)}
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
            <TicketDetail key={selected.id} ticket={selected} onChanged={() => setVersion((current) => current + 1)} />
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
