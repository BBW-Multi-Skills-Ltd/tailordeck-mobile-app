import { ChevronRight, Inbox, MessageCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { useMySupportTicketQuery, useMySupportTicketsQuery } from '../hooks/useSupportQueries'
import type { SupportTicketStatus } from '../services/types'
import type { SupportTicketSummary } from '../services/supportService'

// "My support requests": the user's tickets and TailorDeck's replies (also emailed to them).

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'Received',
  in_review: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

const ticketNumber = (id: string) => `#${id.slice(0, 8).toUpperCase()}`

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return <span className={`support-status support-status-${status}`}>{STATUS_LABELS[status]}</span>
}

function RequestList() {
  const { data: tickets, isLoading, isError, refetch } = useMySupportTicketsQuery()

  if (isLoading) {
    return (
      <div className="stack gap-10" aria-label="Loading">
        {[0, 1, 2].map((index) => (
          <div key={index} className="skeleton support-request-skeleton" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="clay-card empty-state">
        <p className="empty-state-title">Could not load your requests</p>
        <button type="button" className="btn btn-secondary" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    )
  }

  if (!tickets?.length) {
    return (
      <div className="clay-card empty-state">
        <span className="empty-state-icon">
          <Inbox size={26} />
        </span>
        <p className="empty-state-title">No support requests yet</p>
        <p className="empty-state-desc">Requests you send from Help &amp; Support, and our replies, appear here.</p>
        <Link to="/help" className="btn btn-primary">
          Send a request
        </Link>
      </div>
    )
  }

  return (
    <ul className="support-request-list">
      {tickets.map((ticket: SupportTicketSummary) => (
        <li key={ticket.id}>
          <Link to={`/help/requests/${ticket.id}`} className="clay-card support-request-row">
            <span className="support-request-row-top">
              <b>{ticket.subject}</b>
              <StatusBadge status={ticket.status} />
            </span>
            <span className="support-request-row-message">{ticket.message}</span>
            <small>
              {ticketNumber(ticket.id)} · {formatDate(ticket.created_at)}
              {ticket.last_reply_at ? ' · Support replied' : ''}
            </small>
            <ChevronRight size={16} className="support-request-row-chevron" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function RequestThread({ ticketId }: { ticketId: string }) {
  const { data, isLoading, isError, refetch } = useMySupportTicketQuery(ticketId)

  if (isLoading) return <div className="skeleton support-request-skeleton support-request-skeleton-tall" aria-label="Loading" />

  if (isError || !data) {
    return (
      <div className="clay-card empty-state">
        <p className="empty-state-title">{isError ? 'Could not load this request' : 'Request not found'}</p>
        {isError ? (
          <button type="button" className="btn btn-secondary" onClick={() => void refetch()}>
            Try again
          </button>
        ) : (
          <Link to="/help/requests" className="btn btn-secondary">
            All requests
          </Link>
        )}
      </div>
    )
  }

  const { ticket, replies } = data
  return (
    <article className="clay-card support-thread-card">
      <header className="support-thread-head">
        <div>
          <small>{ticketNumber(ticket.id)}</small>
          <p className="settings-help-page-title">{ticket.subject}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </header>

      <div className="support-thread">
        <div className="support-bubble support-bubble-user">
          <p>{ticket.message}</p>
          <small>You · {formatDate(ticket.created_at)}</small>
        </div>
        {replies.map((reply) => (
          <div key={reply.id} className="support-bubble support-bubble-team">
            <p>{reply.body}</p>
            <small>TailorDeck support · {formatDate(reply.created_at)}</small>
          </div>
        ))}
      </div>

      <p className="settings-help-page-copy support-thread-note">
        <MessageCircle size={14} aria-hidden />
        {replies.length
          ? 'We also emailed you this reply. To answer, reply to that email.'
          : 'We have your request. Our reply will appear here and in your email.'}
      </p>
    </article>
  )
}

export default function SupportRequests() {
  const { id = '' } = useParams()
  return (
    <section className="section stack gap-12">
      <PageHeader
        title={id ? 'Support request' : 'My support requests'}
        centered
        leading={<HistoryBackButton fallbackTo={id ? '/help/requests' : '/help'} />}
      />
      {id ? <RequestThread ticketId={id} /> : <RequestList />}
    </section>
  )
}
