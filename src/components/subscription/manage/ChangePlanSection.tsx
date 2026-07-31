import type { SubscriptionPlan } from '../../../lib/settings'
import { billingCycles, type BillingCycle, type PaidPlan, type SubscriptionPlanCard } from '../../../lib/subscriptionPlans'
import SegmentedControl from '../../shared/SegmentedControl'
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
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Change Plan</p>
      <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={onCycleChange} className="subscription-billing-toggle" />
      <SubscriptionPlanCarousel
        ariaLabel="Available plans"
        busyPlanId={isBusy ? selectedPlan : null}
        className="manage-plan-carousel"
        cycle={cycle}
        disabled={isBusy}
        getCtaLabel={(plan) => getManagePlanCta(currentPlan, plan.id)}
        plans={changePlanOptions}
        selectedPlan={selectedPlan}
        onChoosePlan={(plan) => onChoosePlan(plan.id)}
        onSelectedPlanChange={onSelectedPlanChange}
      />
    </section>
  )
}
