import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Inbox, MessageCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { AttachmentList, ChatComposer } from '../components/support/SupportChatParts'
import { useAttachmentLinks } from '../components/support/useAttachmentLinks'
import { useMySupportTicketQuery, useMySupportTicketsQuery, useSendSupportMessageMutation } from '../hooks/useSupportQueries'
import { requestSupportPushPermission } from '../lib/pushNotifications'
import { formatSupportDate, ticketNumber, USER_SUPPORT_STATUS_LABELS } from '../lib/supportFormat'
import { getServiceErrorMessage } from '../services/serviceHelpers'
import type { SupportTicketStatus } from '../services/types'
import type { SupportTicketReply, SupportTicketSummary } from '../services/supportService'

// "My support requests": the user's tickets and TailorDeck's replies (also emailed to them).

const formatDate = (value: string) => formatSupportDate(value, { short: true })

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return <span className={`support-status support-status-${status}`}>{USER_SUPPORT_STATUS_LABELS[status]}</span>
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
              {ticketNumber(ticket.id)} · {formatDate(ticket.last_reply_at ?? ticket.created_at)}
              {ticket.last_message_by === 'support' ? ' · Support replied' : ''}
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

  return <ChatThread ticket={data.ticket} replies={data.replies} />
}

function ChatThread({ ticket, replies }: { ticket: SupportTicketSummary; replies: SupportTicketReply[] }) {
  const sendMessage = useSendSupportMessageMutation(ticket.id)
  const [sendError, setSendError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const links = useAttachmentLinks(replies.flatMap((reply) => reply.attachments))
  const open = ticket.status === 'open' || ticket.status === 'in_review'

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [replies.length])

  async function send(body: string, files: File[]): Promise<boolean> {
    setSendError('')
    try {
      await sendMessage.mutateAsync({ body, files })
      void requestSupportPushPermission()
      return true
    } catch (error) {
      setSendError(getServiceErrorMessage(error, 'Unable to send your message.'))
      return false
    }
  }

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
        {replies.map((reply) => {
          const mine = reply.author_role === 'user'
          return (
            <div key={reply.id} className={`support-bubble ${mine ? 'support-bubble-user' : 'support-bubble-team'}`}>
              {reply.body ? <p>{reply.body}</p> : null}
              <AttachmentList attachments={reply.attachments} links={links} />
              <small>
                {mine ? 'You' : 'TailorDeck support'} · {formatDate(reply.created_at)}
              </small>
            </div>
          )
        })}
        {!replies.some((reply) => reply.author_role === 'support') && open ? (
          <p className="settings-help-page-copy support-thread-note">
            <MessageCircle size={14} aria-hidden /> We have your request. You’ll get a notification when we reply.
          </p>
        ) : null}
        <div ref={endRef} />
      </div>

      {open ? (
        <>
          <ChatComposer sending={sendMessage.isPending} placeholder="Write a message…" onSend={send} />
          {sendError ? <span className="input-error-text">{sendError}</span> : null}
        </>
      ) : (
        <div className="support-thread-closed">
          <p className="settings-help-page-title">This request is {ticket.status === 'closed' ? 'closed' : 'resolved'}</p>
          <p className="settings-help-page-copy">We emailed you the full conversation. Need more help? Start a new request.</p>
          <Link to="/help" className="btn btn-primary btn-full">
            Start a new request
          </Link>
        </div>
      )}
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
