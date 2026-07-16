import { ArrowRight, CalendarCheck, FileText, Scissors, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const previewCards = [
  {
    icon: Scissors,
    label: '3 active jobs',
    detail: 'Agbada due Friday',
  },
  {
    icon: Users,
    label: 'Client measurements',
    detail: 'Saved and easy to reuse',
  },
  {
    icon: TrendingUp,
    label: 'Profit clarity',
    detail: 'Know what enters your pocket',
  },
]

export default function OnboardingPreview() {
  return (
    <main className="page-full onboarding-page onboarding-preview-page">
      <div className="onboarding-shell onboarding-shell-preview">
        <header className="onboarding-preview-head">
          <div className="onboarding-brand-icon" aria-hidden>
            <img src="/Tailor%20deck%20app%20icon%20for%20phone%20screen.png" alt="" className="onboarding-brand-logo" />
          </div>
          <div className="stack gap-4">
            <h1 className="onboarding-title">See your shop in one place</h1>
            <p className="onboarding-preview-subtitle">TailorDeck helps you run each day without searching notebooks or WhatsApp chats.</p>
          </div>
        </header>

        <div className="onboarding-preview-trust">
          <span>Sample workspace</span>
          <span>No signup needed yet</span>
        </div>

        <section className="onboarding-preview-board">
          <div className="onboarding-preview-top">
            <p className="onboarding-preview-kicker">Today</p>
            <p className="onboarding-preview-date">Sample workspace</p>
          </div>

          <div className="onboarding-preview-grid">
            {previewCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={card.label} className="onboarding-preview-stat">
                  <span className="onboarding-preview-icon">
                    <Icon size={15} />
                  </span>
                  <div>
                    <p className="onboarding-preview-stat-label">{card.label}</p>
                    <p className="onboarding-preview-stat-detail">{card.detail}</p>
                  </div>
                </article>
              )
            })}
          </div>

          <article className="onboarding-preview-job">
            <span className="onboarding-preview-avatar">A</span>
            <div className="min-w-0 flex-1">
              <p className="onboarding-preview-job-title">Asoebi Family Pack</p>
              <p className="onboarding-preview-job-meta">Due: Jul 24 - Balance: {'\u20A6'}45,000</p>
            </div>
            <span className="badge badge-progress">In Progress</span>
          </article>

          <div className="onboarding-preview-docs">
            <div className="row gap-8">
              <span className="onboarding-preview-mini-icon">
                <FileText size={15} />
              </span>
              <div>
                <p className="onboarding-preview-doc-title">Professional invoice ready</p>
                <p className="onboarding-preview-doc-text">Send branded PDF invoices and receipts when your job is ready.</p>
              </div>
            </div>
            <div className="row gap-8">
              <span className="onboarding-preview-mini-icon">
                <CalendarCheck size={15} />
              </span>
              <div>
                <p className="onboarding-preview-doc-title">Deadline reminders</p>
                <p className="onboarding-preview-doc-text">Never forget delivery dates or pending balances.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="onboarding-preview-actions">
          <Link to="/auth/signup" className="btn btn-primary btn-full onboarding-primary-btn">
            Create My Shop
            <ArrowRight size={17} />
          </Link>
          <Link to="/auth/signin" className="onboarding-skip-btn">
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  )
}
