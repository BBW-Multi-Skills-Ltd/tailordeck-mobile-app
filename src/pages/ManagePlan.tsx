import { ArrowLeft, CalendarClock, Check, ChevronRight, CircleHelp, CreditCard, ReceiptText, ShieldAlert, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'
import SegmentedControl from '../components/shared/SegmentedControl'
import { loadTailorSettings, saveTailorSettings, type SubscriptionPlan } from '../lib/settings'
import { billingCycles, paidSubscriptionPlans, subscriptionPlans, type BillingCycle, type PaidPlan } from '../lib/subscriptionPlans'

type ManagePlanRowProps = {
  icon: typeof CreditCard
  title: string
  desc: string
  value?: string
  tone?: 'default' | 'danger' | 'success'
}

export default function ManagePlan() {
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>(settings.subscription.billingCycle)
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan>(() => getDefaultManagePlan(loadTailorSettings().subscription.plan))
  const [cancelOpen, setCancelOpen] = useState(false)
  const plan = settings.subscription.plan
  const currentPlan = useMemo(() => subscriptionPlans.find((item) => item.id === plan) ?? subscriptionPlans[0], [plan])
  const changePlanOptions = useMemo(() => getManagePlanOptions(plan), [plan])
  const isPaidPlan = plan === 'starter' || plan === 'pro'
  const cancelScheduled = settings.subscription.cancelAtPeriodEnd
  const trialEndDate = formatRelativeDate(14)
  const renewalDate = formatRelativeDate(cycle === 'yearly' ? 365 : 30)

  useEffect(() => {
    setSelectedPlan(getDefaultManagePlan(plan))
  }, [plan])

  function choosePlan(nextPlan: PaidPlan) {
    setSelectedPlan(nextPlan)
    const nextSettings = saveTailorSettings({
      ...settings,
      subscription: { ...settings.subscription, plan: nextPlan, billingCycle: cycle, cancelAtPeriodEnd: false },
      updatedAt: new Date().toISOString(),
    })
    setSettings(nextSettings)
  }

  function confirmCancel() {
    const nextSettings = saveTailorSettings({
      ...settings,
      subscription: { ...settings.subscription, cancelAtPeriodEnd: true },
      updatedAt: new Date().toISOString(),
    })
    setSettings(nextSettings)
    setCancelOpen(false)
  }

  function keepPlanActive() {
    const nextSettings = saveTailorSettings({
      ...settings,
      subscription: { ...settings.subscription, cancelAtPeriodEnd: false },
      updatedAt: new Date().toISOString(),
    })
    setSettings(nextSettings)
  }

  return (
    <section className="section stack gap-12 manage-plan-page">
      <PageHeader
        title="Manage Plan"
        centered
        leading={(
          <Link to="/settings/subscription" className="btn btn-ghost btn-icon" aria-label="Back to subscription">
            <ArrowLeft size={18} />
          </Link>
        )}
      />

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

      <section className="stack gap-8">
        <p className="more-group-title">Change Plan</p>
        <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} className="subscription-billing-toggle" />
        <div className={`subscription-plan-carousel manage-plan-carousel${changePlanOptions.length === 1 ? ' single' : ''}`} aria-label="Available plans">
          {changePlanOptions.map((item) => (
            <article
              key={item.id}
              className={`subscription-plan-card subscription-plan-slide${selectedPlan === item.id ? ' selected' : ''}`}
              onClick={() => setSelectedPlan(item.id)}
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
                  choosePlan(item.id)
                }}
              >
                {getManagePlanCta(plan, item.id)}
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

      <section className="stack gap-8">
        <p className="more-group-title">{isPaidPlan ? 'Subscription Control' : 'Trial Details'}</p>
        <div className="clay-card more-group-card">
          {cancelScheduled ? (
            <button type="button" className="more-row" onClick={keepPlanActive}>
              <span className="more-row-icon clay-inset manage-plan-row-icon success">
                <Sparkles size={18} />
              </span>
              <span className="stack gap-2 min-w-0 flex-1">
                <span className="more-row-label">Keep {isPaidPlan ? 'Plan' : 'Free Trial'} Active</span>
                <span className="more-row-desc">Remove cancellation and continue normally.</span>
              </span>
              <ChevronRight size={17} className="more-row-chevron" />
            </button>
          ) : isPaidPlan ? (
            <button type="button" className="more-row manage-plan-danger-row" onClick={() => setCancelOpen(true)}>
              <span className="more-row-icon clay-inset">
                <ShieldAlert size={18} />
              </span>
              <span className="stack gap-2 min-w-0 flex-1">
                <span className="more-row-label settings-hub-label danger">Cancel Subscription</span>
                <span className="more-row-desc">Access stays active until the billing period ends.</span>
              </span>
              <ChevronRight size={17} className="more-row-chevron" />
            </button>
          ) : (
            <button type="button" className="more-row manage-plan-danger-row" onClick={() => setCancelOpen(true)}>
              <span className="more-row-icon clay-inset">
                <ShieldAlert size={18} />
              </span>
              <span className="stack gap-2 min-w-0 flex-1">
                <span className="more-row-label settings-hub-label danger">Cancel Free Trial</span>
                <span className="more-row-desc">Access stays active until the trial ends.</span>
              </span>
              <ChevronRight size={17} className="more-row-chevron" />
            </button>
          )}
        </div>
      </section>

      <section className="stack gap-8">
        <p className="more-group-title">Payment History</p>
        <div className="clay-card more-group-card">
          <ManagePlanRow
            icon={ReceiptText}
            title="No payment receipts yet"
            desc="Receipts will appear here after your first payment."
          />
        </div>
      </section>

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

      {cancelOpen ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Cancel subscription" onClick={() => setCancelOpen(false)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{isPaidPlan ? 'Cancel subscription?' : 'Cancel free trial?'}</h3>
            <p>
              {isPaidPlan
                ? 'Your plan will stay active until the end of the current billing period.'
                : 'Your trial will stay active until it ends. No payment will be taken.'}
            </p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setCancelOpen(false)}>
                Keep {isPaidPlan ? 'Plan' : 'Trial'}
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmCancel}>
                Cancel at Period End
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ManagePlanRow({ desc, icon: Icon, title, tone = 'default', value }: ManagePlanRowProps) {
  return (
    <div className="more-row manage-plan-info-row">
      <span className={`more-row-icon clay-inset manage-plan-row-icon ${tone}`}>
        <Icon size={18} />
      </span>
      <span className="stack gap-2 min-w-0 flex-1">
        <span className="more-row-label">{title}</span>
        <span className="more-row-desc">{desc}</span>
      </span>
      {value ? <strong className="manage-plan-row-value">{value}</strong> : null}
    </div>
  )
}

function formatRelativeDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getCurrentPlanMessage(isPaidPlan: boolean, cancelScheduled: boolean, trialEndDate: string): string {
  if (cancelScheduled && isPaidPlan) return 'Your workspace stays active until the billing period ends.'
  if (cancelScheduled) return `Your free trial stays active until ${trialEndDate}.`
  if (isPaidPlan) return 'Your workspace is active.'
  return 'Your free trial is active.'
}

function getManagePlanOptions(plan: SubscriptionPlan) {
  if (plan === 'starter') {
    return paidSubscriptionPlans.filter((item) => item.id === 'pro')
  }

  if (plan === 'pro') {
    return paidSubscriptionPlans.filter((item) => item.id === 'starter')
  }

  return paidSubscriptionPlans
}

function getDefaultManagePlan(plan: SubscriptionPlan): PaidPlan {
  if (plan === 'starter') return 'pro'
  if (plan === 'pro') return 'starter'
  return 'pro'
}

function getManagePlanCta(currentPlan: SubscriptionPlan, nextPlan: PaidPlan): string {
  if (currentPlan === 'starter' && nextPlan === 'pro') return 'Upgrade to Pro'
  if (currentPlan === 'pro' && nextPlan === 'starter') return 'Switch to Starter'
  return `Choose ${nextPlan === 'pro' ? 'Pro' : 'Starter'}`
}
