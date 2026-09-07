import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useJobCreationEntitlementQuery, useStartSubscriptionCheckoutMutation, useSubscriptionQuery } from '../hooks/useFeatureAccess'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import SegmentedControl from '../components/shared/SegmentedControl'
import PaymentTrustNote from '../components/subscription/PaymentTrustNote'
import { SubscriptionPlanCarousel } from '../components/subscription/SubscriptionPlanCarousel'
import { loadTailorSettings } from '../lib/settings'
import { billingCycles, getCurrentPlanCopy, paidSubscriptionPlans, type BillingCycle, type PaidPlan } from '../lib/subscriptionPlans'
import { getServiceErrorMessage } from '../services/serviceHelpers'
import { getEffectiveSubscriptionPlan, getTrialEnd } from '../services/subscriptionService'

export default function SubscriptionPage() {
  const [settings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>(settings.subscription.billingCycle)
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan>(settings.subscription.plan === 'starter' ? 'starter' : 'pro')
  const [planError, setPlanError] = useState('')
  const checkoutMutation = useStartSubscriptionCheckoutMutation()
  const subscriptionQuery = useSubscriptionQuery()
  const entitlementQuery = useJobCreationEntitlementQuery()
  const currentPlan = subscriptionQuery.data?.plan_name ?? settings.subscription.plan
  const effectivePlan = subscriptionQuery.data ? getEffectiveSubscriptionPlan(subscriptionQuery.data) : currentPlan
  const currentPlanCopy = getCurrentPlanCopy(currentPlan, effectivePlan)
  const freeJobLimit = entitlementQuery.data?.job_limit ?? null
  const freeJobsUsed = entitlementQuery.data?.jobs_used ?? 0
  const showFreeUsage = effectivePlan === 'free' && typeof freeJobLimit === 'number'
  const trialEnd = subscriptionQuery.data ? getTrialEnd(subscriptionQuery.data) : null
  const trialStatus = effectivePlan === 'trial' ? formatTrialStatus(trialEnd) : ''
  const visiblePlans = useMemo(() => {
    if (currentPlan === 'starter') return paidSubscriptionPlans.filter((plan) => plan.id === 'pro')
    if (currentPlan === 'pro') return []
    return paidSubscriptionPlans
  }, [currentPlan])
  const sectionTitle = currentPlan === 'starter' ? 'Ready for the full toolkit?' : "Choose the plan that's right for you"
  const activeSelectedPlan = visiblePlans.length === 1 ? visiblePlans[0].id : selectedPlan

  async function choosePlan(plan: PaidPlan) {
    setPlanError('')
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
        <div className="subscription-current-head">
          <div className="stack gap-2 min-w-0 flex-1">
            <div className="subscription-current-title-row">
              <div className="subscription-current-title-status">
                <p className="subscription-current-title">{currentPlanCopy.title}</p>
                <span className="subscription-active-chip">Active</span>
              </div>
              {showFreeUsage ? (
                <span className="subscription-free-usage">
                  {Math.min(freeJobsUsed, freeJobLimit)} of {freeJobLimit} Free jobs used
                </span>
              ) : null}
              {trialStatus ? <span className="subscription-trial-usage">{trialStatus}</span> : null}
            </div>
            <p className="subscription-current-subtitle">{currentPlanCopy.subtitle}</p>
          </div>
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

function formatTrialStatus(trialEnd: string | null): string {
  if (!trialEnd) return ''
  const msLeft = new Date(trialEnd).getTime() - Date.now()
  if (msLeft <= 0) return 'Trial ending'
  const daysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
}




