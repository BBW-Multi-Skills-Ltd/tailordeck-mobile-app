import { Check } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { queryKeys } from '../hooks/queryKeys'
import PageHeader from '../components/shared/PageHeader'
import SegmentedControl from '../components/shared/SegmentedControl'
import { loadTailorSettings, saveTailorSettings, type SubscriptionPlan } from '../lib/settings'
import { billingCycles, subscriptionPlans, type BillingCycle } from '../lib/subscriptionPlans'
import { updateProfile } from '../services/profileService'
import { getServiceErrorMessage } from '../services/serviceHelpers'
import { selectSubscriptionPlan } from '../services/subscriptionService'

export default function OnboardingPlan() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>(settings.subscription.billingCycle)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('free')
  const [savingPlan, setSavingPlan] = useState<SubscriptionPlan | null>(null)

  async function activatePlan(plan: SubscriptionPlan) {
    setSelectedPlan(plan)
    const next = saveTailorSettings({
      ...settings,
      subscription: { ...settings.subscription, plan, billingCycle: cycle, cancelAtPeriodEnd: false },
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
        <PageHeader title="Subscription" centered />

        <section className="wizard-progress-card onboarding-plan-progress" aria-label="Onboarding plan progress 75% complete">
          <div className="row-between wizard-progress-head">
            <p className="wizard-progress-step">Almost done</p>
            <span className="wizard-progress-percent onboarding-plan-progress-percent">75% done</span>
          </div>
          <div className="wizard-progress-track" aria-hidden>
            <span className="wizard-progress-fill" style={{ width: '75%' }} />
          </div>
          <p className="onboarding-plan-progress-copy">Your shop basics are saved. Choose a plan.</p>
        </section>

        <h3 className="subscription-section-title">Choose the plan that's right for you</h3>

        <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} className="subscription-billing-toggle" />

        <div className="subscription-plan-carousel onboarding-plan-carousel" aria-label="Onboarding pricing plans">
          {subscriptionPlans.map((plan) => (
            <article
              key={plan.id}
              className={`subscription-plan-card subscription-plan-slide${selectedPlan === plan.id ? ' selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
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
                className={`btn btn-full subscription-plan-btn${selectedPlan === plan.id ? ' btn-primary' : ' btn-secondary'}`}
                onClick={(event) => {
                  event.stopPropagation()
                  void activatePlan(plan.id)
                }}
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
