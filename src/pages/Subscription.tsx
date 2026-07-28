import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStartSubscriptionCheckoutMutation, useSubscriptionQuery } from '../hooks/useFeatureAccess'
import HistoryBackButton from '../components/shared/HistoryBackButton'
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
  const subscriptionQuery = useSubscriptionQuery()
  const currentPlan = subscriptionQuery.data?.plan_name ?? settings.subscription.plan
  const currentPlanCopy = getCurrentPlanCopy(currentPlan)
  const visiblePlans = useMemo(() => {
    if (currentPlan === 'starter') return paidSubscriptionPlans.filter((plan) => plan.id === 'pro')
    if (currentPlan === 'pro') return []
    return paidSubscriptionPlans
  }, [currentPlan])
  const sectionTitle = currentPlan === 'starter' ? 'Ready for the full toolkit?' : "Choose the plan that's right for you"
  const activeSelectedPlan = visiblePlans.length === 1 ? visiblePlans[0].id : selectedPlan

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
        leading={<HistoryBackButton fallbackTo="/settings" />}
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

      {visiblePlans.length > 0 ? <h3 className="subscription-section-title">{sectionTitle}</h3> : null}

      {visiblePlans.length > 0 ? (
        <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} className="subscription-billing-toggle" />
      ) : null}
      {planFeedback ? <p className="auth-feedback success" role="status">{planFeedback}</p> : null}
      {planError ? <p className="auth-feedback error" role="alert">{planError}</p> : null}

      {visiblePlans.length > 0 ? (
      <div className={`subscription-plan-carousel${visiblePlans.length === 1 ? ' manage-plan-carousel single' : ''}`} aria-label="Pricing plans">
        {visiblePlans.map((plan) => (
          <article
            key={plan.id}
            className={`subscription-plan-card subscription-plan-slide${activeSelectedPlan === plan.id ? ' selected' : ''}`}
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
              className={`btn btn-full subscription-plan-btn${activeSelectedPlan === plan.id ? ' btn-primary' : ' btn-secondary'}`}
                onClick={(event) => {
                  event.stopPropagation()
                  void choosePlan(plan.id)
                }}
                disabled={checkoutMutation.isPending}
              >
              {checkoutMutation.isPending && activeSelectedPlan === plan.id ? 'Opening checkout...' : `Upgrade to ${plan.label}`}
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
      ) : (
        <article className="subscription-current-card subscription-complete-card">
          <p className="subscription-current-title">Full plan active</p>
          <p className="subscription-current-subtitle">You already have Pro. PDF export, sending, analytics, and full document setup are available.</p>
        </article>
      )}
    </section>
  )
}



