import { ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTailorSettings, saveTailorSettings, type SubscriptionPlan } from '../lib/settings'

const PLAN_COPY: Record<Exclude<SubscriptionPlan, 'free'>, { price: string; audience: string; features: string[] }> = {
  starter: {
    price: '\u20A62,500/month or \u20A624,000/year',
    audience: 'Solo tailor, basic use',
    features: [
      'Up to 20 clients',
      'Unlimited jobs',
      'Expense and profit tracking',
      'Deadline reminders',
      'Job history',
    ],
  },
  pro: {
    price: '\u20A64,500/month or \u20A642,000/year',
    audience: 'Active tailor, full features',
    features: [
      'Unlimited clients',
      'Everything in Starter',
      'Invoice and receipt generation',
      'WhatsApp invoice sharing',
      'PDF export',
      'Business dashboard and analytics',
      'Brand customization (logo, colors)',
      'Priority support',
    ],
  },
}

export default function SubscriptionPage() {
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const current = settings.subscription.plan

  function choosePlan(plan: SubscriptionPlan) {
    const next = { ...settings, subscription: { plan } }
    setSettings(saveTailorSettings(next))
    window.alert(`Plan updated to ${plan.toUpperCase()} (UI placeholder).`)
  }

  return (
    <section className="section stack gap-14">
      <header className="row-between">
        <Link to="/settings" className="btn btn-ghost btn-icon" aria-label="Back to settings">
          <ArrowLeft size={18} />
        </Link>
        <h2>Upgrade Plan</h2>
        <span style={{ width: '44px' }} />
      </header>

      <article className="card stack gap-8">
        <p className="text-sm text-muted">Current Plan</p>
        <p className="text-lg font-semibold">{current === 'free' ? 'Free Trial' : current.toUpperCase()}</p>
      </article>

      {(['starter', 'pro'] as const).map((plan) => {
        const data = PLAN_COPY[plan]
        const isActive = current === plan
        return (
          <article key={plan} className={`card stack gap-10 ${isActive ? 'subscription-card-active' : ''}`}>
            <div className="row-between">
              <h3 style={{ textTransform: 'capitalize' }}>{plan}</h3>
              {isActive ? <span className="badge badge-done">Active</span> : null}
            </div>
            <p className="text-sm font-semibold">{data.price}</p>
            <p className="text-sm text-muted">{data.audience}</p>
            <div className="stack gap-6">
              {data.features.map((feature) => (
                <p key={feature} className="text-sm row gap-6">
                  <Check size={14} className="text-success" />
                  {feature}
                </p>
              ))}
            </div>
            <button
              type="button"
              className={`btn btn-full ${isActive ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => choosePlan(plan)}
              disabled={isActive}
            >
              {isActive ? 'Current Plan' : `Choose ${plan[0].toUpperCase()}${plan.slice(1)}`}
            </button>
          </article>
        )
      })}
    </section>
  )
}
