import { ChevronRight, CircleHelp, ReceiptText, ShieldAlert, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ManagePlanRow } from './ManagePlanRow'

type SubscriptionControlSectionProps = {
  cancelScheduled: boolean
  isPaidPlan: boolean
  onCancelClick: () => void
  onKeepActive: () => void
}

export function SubscriptionControlSection({ cancelScheduled, isPaidPlan, onCancelClick, onKeepActive }: SubscriptionControlSectionProps) {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">{isPaidPlan ? 'Subscription Control' : 'Trial Details'}</p>
      <div className="clay-card more-group-card">
        {cancelScheduled ? (
          <button type="button" className="more-row" onClick={onKeepActive}>
            <span className="more-row-icon clay-inset manage-plan-row-icon success">
              <Sparkles size={18} />
            </span>
            <span className="stack gap-2 min-w-0 flex-1">
              <span className="more-row-label">Keep {isPaidPlan ? 'Plan' : 'Free Trial'} Active</span>
              <span className="more-row-desc">Remove cancellation and continue normally.</span>
            </span>
            <ChevronRight size={17} className="more-row-chevron" />
          </button>
        ) : (
          <button type="button" className="more-row manage-plan-danger-row" onClick={onCancelClick}>
            <span className="more-row-icon clay-inset">
              <ShieldAlert size={18} />
            </span>
            <span className="stack gap-2 min-w-0 flex-1">
              <span className="more-row-label settings-hub-label danger">Cancel {isPaidPlan ? 'Subscription' : 'Free Trial'}</span>
              <span className="more-row-desc">Access stays active until the {isPaidPlan ? 'billing period' : 'trial'} ends.</span>
            </span>
            <ChevronRight size={17} className="more-row-chevron" />
          </button>
        )}
      </div>
    </section>
  )
}

export function PaymentHistorySection() {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Payment History</p>
      <div className="clay-card more-group-card">
        <ManagePlanRow icon={ReceiptText} title="No payment receipts yet" desc="Receipts will appear here after your first payment." />
      </div>
    </section>
  )
}

export function ManagePlanSupportSection() {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Support</p>
      <Link to="/help?from=subscription" className="clay-card more-row">
        <span className="more-row-icon clay-inset">
          <CircleHelp size={18} />
        </span>
        <span className="stack gap-2 min-w-0 flex-1">
          <span className="more-row-label">Need Help?</span>
          <span className="more-row-desc">Get help choosing or managing your plan.</span>
        </span>
        <ChevronRight size={17} className="more-row-chevron" />
      </Link>
    </section>
  )
}
