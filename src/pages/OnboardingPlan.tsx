import { Check } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { queryKeys } from '../hooks/queryKeys'
import SegmentedControl from '../components/shared/SegmentedControl'
import { loadTailorSettings, saveTailorSettings, type SubscriptionPlan } from '../lib/settings'
import { updateProfile } from '../services/profileService'
import { getServiceErrorMessage } from '../services/serviceHelpers'
import { selectSubscriptionPlan } from '../services/subscriptionService'

type BillingCycle = 'monthly' | 'yearly'

const billingCycles: BillingCycle[] = ['monthly', 'yearly']

const PLAN_DATA: Array<{
  id: SubscriptionPlan
  label: string
  badge?: string
  recommended?: boolean
  price: { monthly: string; yearly: string }
  suffix: { monthly: string; yearly: string }
  subtitle: string
  helper?: string
  cta: string
  yearlyDiscountNote?: string
  features: string[]
}> = [
  {
    id: 'free',
    label: '14 Days Free Trial',
    badge: 'FREE TRIAL',
    price: { monthly: '\u20A60', yearly: '\u20A60' },
    suffix: { monthly: 'for 14 days', yearly: 'for 14 days' },
    subtitle: 'Get access to all TailorDeck features for 14 days.',
    helper: 'Start free, then upgrade to a plan when your trial ends.',
    cta: 'Get Started',
    features: [
      'Unlimited clients during trial',
      'Invoice and receipt preview',
      'Dashboard analytics',
      'Brand customization preview',
      'Deadline reminders',
    ],
  },
  {
    id: 'starter',
    label: 'Starter',
    badge: 'STARTER',
    price: { monthly: '\u20A62,500', yearly: '\u20A624,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Core operations',
    cta: 'Choose Starter',
    yearlyDiscountNote: 'Save 20%',
    features: ['Clients', 'Jobs', 'Measurements', 'Expenses and profit', 'Reminders', 'Basic history'],
  },
  {
    id: 'pro',
    label: 'Pro',
    badge: 'PRO',
    recommended: true,
    price: { monthly: '\u20A64,500', yearly: '\u20A642,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Growth and professionalism',
    cta: 'Choose Pro',
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
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [savingPlan, setSavingPlan] = useState<SubscriptionPlan | null>(null)

  async function activatePlan(plan: SubscriptionPlan) {
    const next = saveTailorSettings({
      ...settings,
      subscription: { plan },
      updatedAt: new Date().toISOString(),
    })
    setSettings(next)
    setSavingPlan(plan)
    try {
      await selectSubscriptionPlan(plan)
      await updateProfile({ onboarding_complete: true })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription }),
      ])
      window.alert('Plan selected. Welcome to TailorDeck.')
      navigate('/')
    } catch (error) {
      console.error('Unable to activate onboarding plan:', error)
      window.alert(getServiceErrorMessage(error, 'Unable to activate plan.'))
    } finally {
      setSavingPlan(null)
    }
  }

  return (
    <main className="page-full onboarding-page onboarding-page-step">
      <section className="section stack gap-10 subscription-page subscription-page-onboarding">
        <header className="subscription-header">
          <h1 className="subscription-page-title">Subscription</h1>
        </header>

        <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} />

        <h3 className="subscription-section-title">Choose the plan that's right for you</h3>

        <div className="subscription-plan-carousel onboarding-plan-carousel" aria-label="Onboarding pricing plans">
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

              {plan.helper ? <p className="subscription-plan-helper">{plan.helper}</p> : null}

              <div className="subscription-plan-divider" />

              <button
                type="button"
                className={`btn btn-full subscription-plan-btn${plan.id === 'pro' ? ' btn-primary' : ' btn-secondary'}`}
                onClick={() => void activatePlan(plan.id)}
                disabled={savingPlan !== null}
              >
                {savingPlan === plan.id ? 'Saving...' : plan.cta}
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
    </main>
  )
}
