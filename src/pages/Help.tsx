import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Bug, ChevronRight, CreditCard, Lightbulb, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { useSettingsQuery } from '../hooks/useSettingsQueries'
import { useCreateSupportTicketMutation } from '../hooks/useSupportQueries'
import type { SupportTicketCategory, SupportTicketPriority } from '../services/types'
import { getServiceErrorMessage } from '../services/serviceHelpers'

type SupportCategoryConfig = {
  id: SupportTicketCategory
  label: string
  desc: string
  icon: typeof CreditCard
  placeholder: string
  subject: string
  priority: SupportTicketPriority
}

const supportCategories: SupportCategoryConfig[] = [
  {
    id: 'billing',
    label: 'Billing issue',
    desc: 'Payment, plan, renewal, or upgrade problem.',
    icon: CreditCard,
    placeholder: 'Tell us what happened with your payment or plan.',
    subject: 'Billing support request',
    priority: 'urgent',
  },
  {
    id: 'bug',
    label: 'Bug report',
    desc: 'Something is broken or not working as expected.',
    icon: Bug,
    placeholder: 'What happened, what did you expect, and where did it happen?',
    subject: 'Bug report',
    priority: 'urgent',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    desc: 'Suggest an improvement or feature.',
    icon: Lightbulb,
    placeholder: 'What would make TailorDeck better for your shop?',
    subject: 'Product feedback',
    priority: 'normal',
  },
  {
    id: 'account',
    label: 'Account help',
    desc: 'Login, email, security, or account access.',
    icon: ShieldCheck,
    placeholder: 'Tell us what account issue you need help with.',
    subject: 'Account support request',
    priority: 'urgent',
  },
  {
    id: 'general',
    label: 'General question',
    desc: 'Anything else you want to ask.',
    icon: Sparkles,
    placeholder: 'How can we help?',
    subject: 'General support request',
    priority: 'normal',
  },
]

const whatsappNumber = '2349010851071'

export default function Help() {
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('from') === 'subscription' ? '/settings/subscription/manage' : '/more'
  const returnLabel = searchParams.get('from') === 'subscription' ? 'Back to manage plan' : 'Back to more'
  const settingsQuery = useSettingsQuery()
  const createTicket = useCreateSupportTicketMutation()
  const settings = settingsQuery.data
  const [selectedCategory, setSelectedCategory] = useState<SupportTicketCategory>('billing')
  const [message, setMessage] = useState('')
  const [urgentMessage, setUrgentMessage] = useState('')
  const [urgentError, setUrgentError] = useState('')
  const [error, setError] = useState('')
  const [submittedTicketId, setSubmittedTicketId] = useState('')

  const selected = useMemo(
    () => supportCategories.find((item) => item.id === selectedCategory) ?? supportCategories[0],
    [selectedCategory],
  )

  const contactName = settings?.profile.fullName || settings?.businessInfo.shopName || 'TailorDeck user'
  const contactEmail = settings?.profile.email || settings?.businessInfo.businessEmail || ''
  const contactPhone = settings?.profile.phone || settings?.businessInfo.businessPhone || ''

  useEffect(() => {
    if (!submittedTicketId) return undefined
    const timer = window.setTimeout(() => setSubmittedTicketId(''), 6000)
    return () => window.clearTimeout(timer)
  }, [submittedTicketId])

  function openWhatsAppSupport(): void {
    const cleanUrgentMessage = urgentMessage.trim()
    if (cleanUrgentMessage.length < 10) {
      setUrgentError('Please describe what you need help with.')
      return
    }

    setUrgentError('')
    const text = [
      'Hello TailorDeck Support,',
      '',
      `My name is ${contactName}.`,
      `Issue type: Urgent support`,
      `Message: ${cleanUrgentMessage}`,
      contactEmail ? `Account email: ${contactEmail}` : '',
      contactPhone ? `Phone: ${contactPhone}` : '',
    ].filter(Boolean).join('\n')

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError('')
    setSubmittedTicketId('')

    const cleanMessage = message.trim()
    if (cleanMessage.length < 10) {
      setError('Please add a short message so support can understand the issue.')
      return
    }

    try {
      const ticket = await createTicket.mutateAsync({
        category: selected.id,
        priority: selected.priority,
        subject: selected.subject,
        message: cleanMessage,
        accountEmail: contactEmail,
        contactPhone,
        metadata: {
          source: 'help_page',
          selectedLabel: selected.label,
        },
      })
      setSubmittedTicketId(ticket.id)
      setMessage('')
    } catch (submitError) {
      setError(getServiceErrorMessage(submitError, 'Unable to send support request.'))
    }
  }

  return (
    <section className="section stack gap-12">
      <PageHeader
        title="Help & Support"
        centered
        leading={<HistoryBackButton fallbackTo={returnTo} label={returnLabel} />}
      />

      <article className="support-urgent-card clay-card">
        <div className="support-card-heading">
          <span className="support-icon-pill"><MessageCircle size={18} /></span>
          <div>
            <p className="settings-help-page-title">Need urgent help?</p>
            <p className="settings-help-page-copy">Chat with TailorDeck support on WhatsApp.</p>
          </div>
        </div>
        <textarea
          className={`support-textarea support-textarea-compact${urgentError ? ' input-invalid input-shake' : ''}`}
          placeholder="Briefly describe what you need help with."
          value={urgentMessage}
          aria-invalid={Boolean(urgentError)}
          aria-describedby={urgentError ? 'urgent-support-error' : undefined}
          onChange={(event) => {
            setUrgentMessage(event.target.value)
            if (urgentError) setUrgentError('')
          }}
        />
        {urgentError ? <span id="urgent-support-error" className="input-error-text">{urgentError}</span> : null}
        <button type="button" className="btn btn-primary btn-full" onClick={openWhatsAppSupport}>
          Chat on WhatsApp
          <ChevronRight size={16} />
        </button>
      </article>

      <article className="clay-card support-flow-card">
        <div className="support-card-heading">
          <span className="support-icon-pill support-icon-pill-muted"><AlertTriangle size={18} /></span>
          <div>
            <p className="settings-help-page-title">Send a support request</p>
            <p className="settings-help-page-copy">Choose one topic and tell us what happened.</p>
          </div>
        </div>

        <div className="support-category-scroll" aria-label="Support categories">
          {supportCategories.map((item) => {
            const Icon = item.icon
            const active = selectedCategory === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`support-category-card${active ? ' active' : ''}`}
                onClick={() => {
                  setSelectedCategory(item.id)
                  setError('')
                  setSubmittedTicketId('')
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <motion.form
          key={selected.id}
          className="support-form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', mass: 0.5, damping: 15, stiffness: 100 }}
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="support-selected-card">
            <p>{selected.label}</p>
            <span>{selected.desc}</span>
          </div>

          <label className="input-group">
            <span className="auth-label">Message</span>
            <textarea
              className={`support-textarea${error ? ' input-invalid input-shake' : ''}`}
              placeholder={selected.placeholder}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                if (error) setError('')
              }}
            />
            {error ? <span className="input-error-text">{error}</span> : null}
          </label>

          <button type="submit" className="btn btn-primary btn-full" disabled={createTicket.isPending}>
            {createTicket.isPending ? 'Sending...' : 'Send Request'}
          </button>

          {submittedTicketId ? (
            <p className="support-success-text" role="status">
              Request sent. Ticket #{submittedTicketId.slice(0, 8).toUpperCase()}.
            </p>
          ) : null}
        </motion.form>
      </article>
    </section>
  )
}
