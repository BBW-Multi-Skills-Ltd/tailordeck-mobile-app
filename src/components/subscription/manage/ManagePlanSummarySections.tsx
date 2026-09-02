import { CalendarClock, CreditCard } from 'lucide-react'
import type { BillingCycle, SubscriptionPlanCard } from '../../../lib/subscriptionPlans'
import { getCurrentPlanMessage } from './managePlanUtils'
import { ManagePlanRow } from './ManagePlanRow'

type CurrentPlanSectionProps = {
  cancelScheduled: boolean
  currentPlan: SubscriptionPlanCard
  isPaidPlan: boolean
  isTrialActive: boolean
  trialEndDate: string
}

export function CurrentPlanSection({ cancelScheduled, currentPlan, isPaidPlan, isTrialActive, trialEndDate }: CurrentPlanSectionProps) {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Current Plan</p>
      <div className="clay-card manage-plan-current-card">
        <div className="row-between">
          <div className="stack gap-4">
            <h2>{currentPlan.label}</h2>
            <p>{getCurrentPlanMessage(isPaidPlan, cancelScheduled, trialEndDate, isTrialActive)}</p>
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
  isTrialActive: boolean
  renewalDate: string
  trialEndDate: string
}

export function BillingSummarySection({ currentPlan, cycle, isPaidPlan, isTrialActive, renewalDate, trialEndDate }: BillingSummarySectionProps) {
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
          title={isPaidPlan ? 'Next Renewal' : isTrialActive ? 'Trial Ends' : 'Free Plan'}
          desc={isPaidPlan ? 'Your next billing date' : isTrialActive ? 'Upgrade before this date to continue' : 'Upgrade anytime for unlimited jobs'}
          value={isPaidPlan ? renewalDate : isTrialActive ? trialEndDate : '3 jobs included'}
        />
      </div>
    </section>
  )
}
