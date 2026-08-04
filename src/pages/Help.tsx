import { BookOpen, ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

const helpItems = [
  {
    icon: BookOpen,
    label: 'Getting Started',
    desc: 'Learn how clients, jobs, invoices, and reminders work.',
  },
  {
    icon: MessageCircle,
    label: 'Contact Support',
    desc: 'Send us a message.',
  },
  {
    icon: ShieldCheck,
    label: 'Account Safety',
    desc: 'Understand security, backups, and business data privacy.',
  },
]

export default function Help() {
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('from') === 'subscription' ? '/settings/subscription/manage' : '/more'
  const returnLabel = searchParams.get('from') === 'subscription' ? 'Back to manage plan' : 'Back to more'

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Help & Support"
        centered
        leading={<HistoryBackButton fallbackTo={returnTo} label={returnLabel} />}
      />

      <article className="clay-card settings-standalone-card stack gap-8">
        <p className="settings-help-page-title">How can we help?</p>
        <p className="settings-help-page-copy">Choose the topic closest to what you need.</p>
      </article>

      <div className="clay-card more-group-card">
        {helpItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button key={item.label} type="button" className="more-row settings-help-row">
              <span className="more-row-icon clay-inset">
                <Icon size={18} />
              </span>
              <span className="stack gap-2 min-w-0 flex-1">
                <span className="more-row-label">{item.label}</span>
                <span className="more-row-desc">{item.desc}</span>
              </span>
              <ChevronRight size={17} className="more-row-chevron" />
              {index < helpItems.length - 1 ? <span className="more-row-divider" aria-hidden /> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
