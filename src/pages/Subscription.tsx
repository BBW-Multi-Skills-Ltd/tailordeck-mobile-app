import { AlertCircle, ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'
import ProgressHeader from '../components/shared/ProgressHeader'
import SegmentedControl from '../components/shared/SegmentedControl'
import { loadTailorSettings, saveTailorSettings } from '../lib/settings'

type BillingCycle = 'monthly' | 'yearly'
type PaidPlan = 'starter' | 'pro'

const PLAN_DATA: Array<{
  id: PaidPlan
  label: string
  badge?: string
  recommended?: boolean
  price: { monthly: string; yearly: string }
  suffix: { monthly: string; yearly: string }
  subtitle: string
  yearlyDiscountNote?: string
  features: string[]
}> = [
  {
    id: 'starter',
    label: 'Starter',
    badge: 'STARTER',
    price: { monthly: '\u20A62,500', yearly: '\u20A624,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Core operations',
    yearlyDiscountNote: 'Save 20%',
    features: [
      'Clients',
      'Jobs',
      'Measurements',
      'Expenses and profit',
      'Reminders',
      'Basic history',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    badge: 'PRO',
    recommended: true,
    price: { monthly: '\u20A64,500', yearly: '\u20A642,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Growth and professionalism',
    yearlyDiscountNote: 'Save 22%',
    features: [
      'Everything in Starter',
      'Invoice and receipt PDF',
      'WhatsApp sharing',
      'Dashboard analytics',
      'Brand customization (logo, colors, signature)',
      'Priority support',
    ],
  },
]

const billingCycles: BillingCycle[] = ['monthly', 'yearly']

export default function SubscriptionPage() {
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  function choosePlan(plan: PaidPlan) {
    const next = { ...settings, subscription: { plan } }
    setSettings(saveTailorSettings(next))
    window.alert(`${plan.toUpperCase()} upgrade flow will be connected to payments backend.`)
  }

  return (
    <section className="section stack gap-12 subscription-page">
      <PageHeader
        title="Subscription"
        centered
        leading={(
          <Link to="/settings" className="btn btn-ghost btn-icon subscription-back-btn" aria-label="Back to settings">
            <ArrowLeft size={18} />
          </Link>
        )}
      />

      <article className="subscription-current-card">
        <div className="row-between">
          <div className="stack gap-2">
            <p className="subscription-current-title">Free Trial</p>
            <p className="subscription-current-subtitle">Pro tools are active during your trial. Upgrade before it ends to keep them available.</p>
          </div>
          <span className="subscription-active-chip">Active</span>
        </div>
        <button type="button" className="btn btn-secondary btn-full subscription-manage-btn">
          Manage Plan
        </button>
      </article>

      <ProgressHeader
        title="Trial momentum"
        description="You have already started your shop workspace. Keep invoices, sharing, analytics, and branding active by choosing a plan before trial expiry."
        percent={70}
        className="subscription-progress-card"
      />

      <article className="subscription-trial-note">
        <span className="subscription-trial-note-icon">
          <AlertCircle size={16} />
        </span>
        <div className="stack gap-2">
          <strong>Keep your professional tools active</strong>
          <p>Without an active plan, branded PDF invoices, WhatsApp sharing, analytics, and invoice customization will pause.</p>
        </div>
      </article>

      <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} />

      <h3 className="subscription-section-title">Choose the plan that's right for you</h3>

      <div className="subscription-plan-carousel" aria-label="Pricing plans">
        {PLAN_DATA.map((plan) => (
          <article key={plan.id} className={`subscription-plan-card subscription-plan-slide${plan.id === 'pro' ? ' pro-card' : ''}`}>
            <div className="subscription-plan-badges">
              {plan.badge ? <span className={`subscription-plan-badge${plan.id === 'pro' ? ' pro' : ''}`}>{plan.badge}</span> : null}
              {plan.recommended ? <span className="subscription-plan-badge recommended">RECOMMENDED</span> : null}
              {cycle === 'yearly' && plan.yearlyDiscountNote ? <span className="subscription-plan-badge save">{plan.yearlyDiscountNote}</span> : null}
            </div>

            <div className="subscription-plan-top">
              <h2>{plan.label}</h2>
              <p>{plan.subtitle}</p>
            </div>

            <div className="subscription-price-row">
              <span className="subscription-price">{plan.price[cycle]}</span>
              <span className="subscription-price-suffix">{plan.suffix[cycle]}</span>
            </div>

            <div className="subscription-plan-divider" />

            <button
              type="button"
              className={`btn btn-full subscription-plan-btn${plan.id === 'pro' ? ' btn-primary' : ' btn-secondary'}`}
              onClick={() => choosePlan(plan.id)}
            >
              {`Upgrade to ${plan.label}`}
            </button>

            <div className="subscription-plan-divider" />

            <p className="subscription-highlights-title">Plan highlights:</p>
            <div className="stack gap-6 subscription-feature-list">
              {plan.features.map((feature) => (
                <p key={feature} className="subscription-feature-item">
                  <span className="subscription-feature-icon">
                    <Check size={10} />
                  </span>
                  <span>{feature}</span>
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
