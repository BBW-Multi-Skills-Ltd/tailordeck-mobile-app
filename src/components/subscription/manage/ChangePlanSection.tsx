import type { SubscriptionPlan } from '../../../lib/settings'
import { googlePlayBillingPendingMessage, isGooglePlayBillingPending } from '../../../lib/billingPlatform'
import { billingCycles, type BillingCycle, type PaidPlan, type SubscriptionPlanCard } from '../../../lib/subscriptionPlans'
import SegmentedControl from '../../shared/SegmentedControl'
import PaymentTrustNote from '../PaymentTrustNote'
import { SubscriptionPlanCarousel } from '../SubscriptionPlanCarousel'
import { getManagePlanCta } from './managePlanUtils'

type ChangePlanSectionProps = {
  changePlanOptions: Array<SubscriptionPlanCard & { id: PaidPlan }>
  currentPlan: SubscriptionPlan
  cycle: BillingCycle
  isBusy?: boolean
  selectedPlan: PaidPlan
  onChoosePlan: (plan: PaidPlan) => void | Promise<void>
  onCycleChange: (cycle: BillingCycle) => void
  onSelectedPlanChange: (plan: PaidPlan) => void
}

export function ChangePlanSection({
  changePlanOptions,
  currentPlan,
  cycle,
  isBusy = false,
  onChoosePlan,
  onCycleChange,
  onSelectedPlanChange,
  selectedPlan,
}: ChangePlanSectionProps) {
  const googlePlayBillingPending = isGooglePlayBillingPending()

  return (
    <section className="stack gap-8">
      <p className="more-group-title">Change Plan</p>
      <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={onCycleChange} className="subscription-billing-toggle" />
      {!googlePlayBillingPending ? <PaymentTrustNote /> : (
        <p className="payment-trust-note payment-trust-note-warning" role="status">
          {googlePlayBillingPendingMessage}
        </p>
      )}
      <SubscriptionPlanCarousel
        ariaLabel="Available plans"
        busyPlanId={isBusy ? selectedPlan : null}
        className="manage-plan-carousel"
        cycle={cycle}
        disabled={isBusy}
        getUnavailableLabel={() => 'Unavailable'}
        getCtaLabel={(plan) => getManagePlanCta(currentPlan, plan.id)}
        isPlanUnavailable={() => googlePlayBillingPending}
        plans={changePlanOptions}
        selectedPlan={selectedPlan}
        onChoosePlan={(plan) => onChoosePlan(plan.id)}
        onSelectedPlanChange={onSelectedPlanChange}
      />
    </section>
  )
}
