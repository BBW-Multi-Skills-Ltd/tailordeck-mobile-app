import { Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { markOnboardingCompleted } from '../lib/auth'
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
  yearlyDiscountNote?: string
  features: string[]
}> = [
  {
    id: 'free',
    label: 'Free Trial',
    badge: 'FREE TRIAL',
    price: { monthly: '₦0', yearly: '₦0' },
    suffix: { monthly: 'for 14 days', yearly: 'for 14 days' },
    subtitle: 'Everyone starting out',
    features: ['All Pro features for 14 days'],
  },
  {
    id: 'starter',
    label: 'Starter',
    badge: 'STARTER',
    price: { monthly: '₦2,500', yearly: '₦24,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Core operations',
    yearlyDiscountNote: 'Save 20%',
    features: ['Clients', 'Jobs', 'Measurements', 'Expenses and profit', 'Reminders', 'Basic history'],
  },
  {
    id: 'pro',
    label: 'Pro',
    badge: 'PRO',
    recommended: true,
    price: { monthly: '₦4,500', yearly: '₦42,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Growth and professionalism',
    yearlyDiscountNote: 'Save 22%',
    features: [
      'Everything in Starter',
      'Invoice and receipt PDF',
      'WhatsApp sharing',
      'Dashboard analytics',
      'Brand customization',
      'Priority support',
    ],
  },
]

export default function OnboardingPlan() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('free')

  function activatePlan(plan: SubscriptionPlan) {
    const next = saveTailorSettings({
      ...settings,
      subscription: { plan },
      updatedAt: new Date().toISOString(),
    })
    setSettings(next)
    markOnboardingCompleted()
    window.alert('Plan selected. Welcome to TailorDeck.')
    navigate('/')
  }

  const activePlan = PLAN_DATA.find((plan) => plan.id === selectedPlan)

  return (
    <main className="page-full onboarding-page onboarding-page-step">
      <section className="section stack gap-10 subscription-page subscription-page-onboarding">
        <header className="subscription-header">
          <h1 className="subscription-page-title">Subscription</h1>
        </header>

        <article className="subscription-current-card">
          <div className="row-between">
            <div className="stack gap-2">
              <p className="subscription-current-title">Free Trial</p>
              <p className="subscription-current-subtitle">Still on free trial</p>
            </div>
            <span className="subscription-active-chip">Active</span>
          </div>
          <button type="button" className="btn btn-secondary btn-full subscription-manage-btn" onClick={() => activatePlan('free')}>
            Start 14 Days Free Trial
          </button>
        </article>

        <h3 className="subscription-section-title">Choose a Plan</h3>

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

        {activePlan && selectedPlan !== 'free' ? (
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

            <button type="button" className="btn btn-secondary btn-full subscription-plan-btn" onClick={() => activatePlan(activePlan.id as PaidPlan)}>
              {`Choose ${activePlan.label}`}
            </button>
          </article>
        ) : null}
      </section>
    </main>
  )
}
