import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStartSubscriptionCheckoutMutation, useSubscriptionQuery } from '../hooks/useFeatureAccess'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import SegmentedControl from '../components/shared/SegmentedControl'
import PaymentTrustNote from '../components/subscription/PaymentTrustNote'
import { SubscriptionPlanCarousel } from '../components/subscription/SubscriptionPlanCarousel'
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
      {visiblePlans.length > 0 ? <PaymentTrustNote /> : null}
      {planFeedback ? <p className="auth-feedback success" role="status">{planFeedback}</p> : null}
      {planError ? <p className="auth-feedback error" role="alert">{planError}</p> : null}

      {visiblePlans.length > 0 ? (
        <SubscriptionPlanCarousel
          ariaLabel="Pricing plans"
          busyPlanId={checkoutMutation.isPending ? activeSelectedPlan : null}
          className="manage-plan-carousel"
          cycle={cycle}
          disabled={checkoutMutation.isPending}
          getBusyLabel={() => 'Opening checkout...'}
          getCtaLabel={(plan) => `Upgrade to ${plan.label}`}
          plans={visiblePlans}
          selectedPlan={activeSelectedPlan}
          onChoosePlan={(plan) => choosePlan(plan.id)}
          onSelectedPlanChange={setSelectedPlan}
        />
      ) : (
        <article className="subscription-current-card subscription-complete-card">
          <p className="subscription-current-title">Full plan active</p>
          <p className="subscription-current-subtitle">You already have Pro. PDF export, sending, analytics, and full document setup are available.</p>
        </article>
      )}
    </section>
  )
}




