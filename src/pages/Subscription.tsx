import { ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStartSubscriptionCheckoutMutation } from '../hooks/useFeatureAccess'
import PageHeader from '../components/shared/PageHeader'
import SegmentedControl from '../components/shared/SegmentedControl'
import { loadTailorSettings } from '../lib/settings'
import { billingCycles, getCurrentPlanCopy, paidSubscriptionPlans, type BillingCycle, type PaidPlan } from '../lib/subscriptionPlans'
import { getServiceErrorMessage } from '../services/serviceHelpers'

export default function SubscriptionPage() {
  const [settings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>(settings.subscription.billingCycle)
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan>(settings.subscription.plan === 'starter' ? 'starter' : 'pro')
  const [planFeedback, setPlanFeedback] = useState('')
  const [planError, setPlanError] = useState('')
  const checkoutMutation = useStartSubscriptionCheckoutMutation()
  const currentPlanCopy = getCurrentPlanCopy(settings.subscription.plan)

  async function choosePlan(plan: PaidPlan) {
    setPlanError('')
    setPlanFeedback('')
    setSelectedPlan(plan)
    try {
      const checkout = await checkoutMutation.mutateAsync({ planName: plan, billingCycle: cycle })
      window.sessionStorage.setItem('tailordeck-paystack-return', '/settings/subscription')
      window.location.assign(checkout.authorizationUrl)
    } catch (error) {
      setPlanError(getServiceErrorMessage(error, 'Unable to start checkout.'))
    }
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
            <p className="subscription-current-title">{currentPlanCopy.title}</p>
            <p className="subscription-current-subtitle">{currentPlanCopy.subtitle}</p>
          </div>
          <span className="subscription-active-chip">Active</span>
        </div>
        <Link to="/settings/subscription/manage" className="btn btn-secondary btn-full subscription-manage-btn">
          Manage Plan
        </Link>
      </article>

      <h3 className="subscription-section-title">Choose the plan that's right for you</h3>

      <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} className="subscription-billing-toggle" />
      {planFeedback ? <p className="auth-feedback success" role="status">{planFeedback}</p> : null}
      {planError ? <p className="auth-feedback error" role="alert">{planError}</p> : null}

      <div className="subscription-plan-carousel" aria-label="Pricing plans">
        {paidSubscriptionPlans.map((plan) => (
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

            <div className="subscription-plan-divider" />

            <button
              type="button"
              className={`btn btn-full subscription-plan-btn${selectedPlan === plan.id ? ' btn-primary' : ' btn-secondary'}`}
                onClick={(event) => {
                  event.stopPropagation()
                  void choosePlan(plan.id)
                }}
                disabled={checkoutMutation.isPending}
              >
              {checkoutMutation.isPending && selectedPlan === plan.id ? 'Opening checkout...' : `Upgrade to ${plan.label}`}
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
