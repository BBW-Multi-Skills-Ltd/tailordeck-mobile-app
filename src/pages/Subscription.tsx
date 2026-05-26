import { ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTailorSettings, saveTailorSettings, type SubscriptionPlan } from '../lib/settings'

type BillingCycle = 'monthly' | 'yearly'
type PaidPlan = 'starter' | 'pro'

const PLAN_DATA: Array<{
  id: SubscriptionPlan
  label: string
  badge?: string
  recommended?: boolean
  price: { monthly: string; yearly: string }
  suffix: { monthly: string; yearly: string }
  subtitle: string
  helper?: string
  yearlyDiscountNote?: string
  features: string[]
}> = [
  {
    id: 'free',
    label: 'Free Trial',
    badge: 'FREE TRIAL',
    price: { monthly: '\u20A60', yearly: '\u20A60' },
    suffix: { monthly: 'for 14 days', yearly: 'for 14 days' },
    subtitle: 'Everyone starting out',
    helper: 'All Pro features trial-enabled for 14 days',
    features: [],
  },
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

export default function SubscriptionPage() {
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan>('starter')
  const current: SubscriptionPlan = 'free'

  function choosePlan(plan: PaidPlan) {
    const next = { ...settings, subscription: { plan: current } }
    setSettings(saveTailorSettings(next))
    window.alert(`${plan.toUpperCase()} upgrade flow will be connected to payments backend.`)
  }

  const activePlan = PLAN_DATA.find((plan) => plan.id === selectedPlan)
  if (!activePlan) return null

  return (
    <section className="section stack gap-10 subscription-page">
      <header className="subscription-header subscription-header-with-back">
        <Link to="/settings" className="btn btn-ghost btn-icon subscription-back-btn" aria-label="Back to settings">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="subscription-page-title app-page-heading">Subscription</h1>
        <span className="subscription-header-spacer" aria-hidden />
      </header>

      <article className="subscription-current-card">
        <div className="row-between">
          <div className="stack gap-2">
            <p className="subscription-current-title">Free Trial</p>
            <p className="subscription-current-subtitle">Still on free trial</p>
          </div>
          <span className="subscription-active-chip">Active</span>
        </div>
        <button type="button" className="btn btn-secondary btn-full subscription-manage-btn">
          Manage Plan
        </button>
      </article>

      <h3 className="subscription-section-title">Pricing Plans</h3>

      <div className="subscription-plan-tabs">
        <button
          type="button"
          className={`subscription-plan-tab${selectedPlan === 'starter' ? ' active' : ''}`}
          onClick={() => setSelectedPlan('starter')}
        >
          Starter
        </button>
        <button
          type="button"
          className={`subscription-plan-tab${selectedPlan === 'pro' ? ' active' : ''}`}
          onClick={() => setSelectedPlan('pro')}
        >
          Pro
        </button>
      </div>

      <div className="stack gap-10">
        <article className={`subscription-plan-card${activePlan.id === 'pro' ? ' pro-card' : ''}`}>
          <div className="subscription-plan-badges">
            {activePlan.badge ? <span className={`subscription-plan-badge${activePlan.id === 'pro' ? ' pro' : ''}`}>{activePlan.badge}</span> : null}
            {activePlan.recommended ? <span className="subscription-plan-badge recommended">RECOMMENDED</span> : null}
          </div>

          <div className="subscription-inline-cycle">
            <button
              type="button"
              className={`subscription-inline-cycle-btn${cycle === 'monthly' ? ' active' : ''}`}
              onClick={() => setCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`subscription-inline-cycle-btn${cycle === 'yearly' ? ' active' : ''}`}
              onClick={() => setCycle('yearly')}
            >
              Yearly
            </button>
            {cycle === 'yearly' && activePlan.yearlyDiscountNote ? <span className="subscription-discount-note">{activePlan.yearlyDiscountNote}</span> : null}
          </div>

          <div className="subscription-price-row">
            <span className="subscription-price">{activePlan.price[cycle]}</span>
            <span className="subscription-price-suffix">{activePlan.suffix[cycle]}</span>
          </div>

          <p className="subscription-plan-subtitle">{activePlan.subtitle}</p>
          {activePlan.helper ? <p className="subscription-plan-helper">{activePlan.helper}</p> : null}

          <div className="stack gap-6 subscription-feature-list">
            {activePlan.features.map((feature) => (
              <p key={feature} className="subscription-feature-item">
                <span className="subscription-feature-icon">
                  <Check size={10} />
                </span>
                <span>{feature}</span>
              </p>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-full subscription-plan-btn"
            onClick={() => choosePlan(activePlan.id as PaidPlan)}
          >
            {`Upgrade to ${activePlan.label}`}
          </button>
        </article>
      </div>
    </section>
  )
}
