import { CalendarClock, CreditCard } from 'lucide-react'
import type { BillingCycle, SubscriptionPlanCard } from '../../../lib/subscriptionPlans'
import { getCurrentPlanMessage } from './managePlanUtils'
import { ManagePlanRow } from './ManagePlanRow'

type CurrentPlanSectionProps = {
  cancelScheduled: boolean
  currentPlan: SubscriptionPlanCard
  isPaidPlan: boolean
  trialEndDate: string
}

export function CurrentPlanSection({ cancelScheduled, currentPlan, isPaidPlan, trialEndDate }: CurrentPlanSectionProps) {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Current Plan</p>
      <div className="clay-card manage-plan-current-card">
        <div className="row-between">
          <div className="stack gap-4">
            <h2>{currentPlan.label}</h2>
            <p>{getCurrentPlanMessage(isPaidPlan, cancelScheduled, trialEndDate)}</p>
          </div>
          <span className={`manage-plan-status${cancelScheduled ? ' warning' : ''}`}>
            {cancelScheduled ? 'Ends soon' : 'Active'}
          </span>
        </div>
      </div>
    </section>
  )
}

type BillingSummarySectionProps = {
  currentPlan: SubscriptionPlanCard
  cycle: BillingCycle
  isPaidPlan: boolean
  renewalDate: string
  trialEndDate: string
}

export function BillingSummarySection({ currentPlan, cycle, isPaidPlan, renewalDate, trialEndDate }: BillingSummarySectionProps) {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Billing Summary</p>
      <div className="clay-card more-group-card">
        <ManagePlanRow
          icon={CreditCard}
          title={cycle === 'yearly' ? 'Yearly Amount' : 'Monthly Amount'}
          desc={isPaidPlan ? 'Current billing amount' : 'No payment yet'}
          value={isPaidPlan ? `${currentPlan.price[cycle]}${currentPlan.suffix[cycle]}` : '\u20A60'}
        />
        <span className="more-row-divider" aria-hidden />
        <ManagePlanRow
          icon={CalendarClock}
          title={isPaidPlan ? 'Next Renewal' : 'Trial Ends'}
          desc={isPaidPlan ? 'Your next billing date' : 'Upgrade before this date to continue'}
          value={isPaidPlan ? renewalDate : trialEndDate}
        />
      </div>
    </section>
  )
}
