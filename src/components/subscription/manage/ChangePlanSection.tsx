import { Check } from 'lucide-react'
import type { SubscriptionPlan } from '../../../lib/settings'
import { billingCycles, type BillingCycle, type PaidPlan, type SubscriptionPlanCard } from '../../../lib/subscriptionPlans'
import SegmentedControl from '../../shared/SegmentedControl'
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
      <div className={`subscription-plan-carousel manage-plan-carousel${changePlanOptions.length === 1 ? ' single' : ''}`} aria-label="Available plans">
        {changePlanOptions.map((item) => (
          <article
            key={item.id}
            className={`subscription-plan-card subscription-plan-slide${selectedPlan === item.id ? ' selected' : ''}`}
            onClick={() => onSelectedPlanChange(item.id)}
          >
            <div className="subscription-plan-badges">
              {item.badge ? <span className={`subscription-plan-badge${item.id === 'pro' ? ' pro' : ''}`}>{item.badge}</span> : null}
              {item.recommended ? <span className="subscription-plan-badge recommended">RECOMMENDED</span> : null}
              {cycle === 'yearly' && item.yearlyDiscountNote ? <span className="subscription-plan-badge save">{item.yearlyDiscountNote}</span> : null}
            </div>

            <div className="subscription-plan-top">
              <h2>{item.label}</h2>
              <p>{item.subtitle}</p>
            </div>

            <div className="subscription-price-row">
              <span className="subscription-price">{item.price[cycle]}</span>
              <span className="subscription-price-suffix">{item.suffix[cycle]}</span>
            </div>

            <div className="subscription-plan-divider" />

            <button
              type="button"
              className={`btn btn-full subscription-plan-btn${selectedPlan === item.id ? ' btn-primary' : ' btn-secondary'}`}
              onClick={(event) => {
                event.stopPropagation()
                void onChoosePlan(item.id)
              }}
              disabled={isBusy}
            >
              {isBusy && selectedPlan === item.id ? 'Saving...' : getManagePlanCta(currentPlan, item.id)}
            </button>

            <div className="subscription-plan-divider" />

            <p className="subscription-highlights-title">Plan highlights:</p>
            <div className="stack gap-6 subscription-feature-list">
              {item.features.map((feature) => (
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
