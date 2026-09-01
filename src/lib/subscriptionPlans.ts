import type { EffectiveSubscriptionPlan } from '../services/subscriptionService'
import type { SubscriptionPlan } from './settingsTypes'

export type BillingCycle = 'monthly' | 'yearly'
export type PaidPlan = Exclude<SubscriptionPlan, 'free'>

export type SubscriptionPlanCard = {
  id: SubscriptionPlan
  label: string
  badge?: string
  recommended?: boolean
  price: Record<BillingCycle, string>
  suffix: Record<BillingCycle, string>
  subtitle: string
  helper?: string
  cta: string
  yearlyDiscountNote?: string
  features: string[]
}

export const billingCycles: BillingCycle[] = ['monthly', 'yearly']

export const subscriptionPlans: SubscriptionPlanCard[] = [
  {
    id: 'free',
    label: 'Free',
    badge: '14-DAY FULL TRIAL',
    price: { monthly: '\u20A60', yearly: '\u20A60' },
    suffix: { monthly: 'forever', yearly: 'forever' },
    subtitle: 'Start with full access',
    helper: 'Full access for 14 days. After that, keep using TailorDeck with 3 jobs included.',
    cta: 'Start Free',
    features: [
      'Full access for 14 days',
      'Continue free after trial',
      '3 jobs included after trial',
      'Invoice and receipt preview',
      'Upgrade anytime',
    ],
  },
  {
    id: 'starter',
    label: 'Starter',
    badge: 'STARTER',
    price: { monthly: '\u20A62,500', yearly: '\u20A624,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Daily job operations',
    cta: 'Choose Starter',
    yearlyDiscountNote: 'Save 20%',
    features: [
      'Create and manage jobs',
      'Auto-save clients from jobs',
      'Single, couple, and family measurements',
      'Materials, pricing, costing, and profit check',
      'Delivery dates and reminder timing',
      'Basic invoice and receipt preview',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    badge: 'PRO',
    recommended: true,
    price: { monthly: '\u20A64,500', yearly: '\u20A642,000' },
    suffix: { monthly: '/month', yearly: '/year' },
    subtitle: 'Documents and growth',
    cta: 'Choose Pro',
    yearlyDiscountNote: 'Save 22%',
    features: [
      'Everything in Starter',
      'PDF invoice and receipt export',
      'Send invoice and receipt to client',
      'Full dashboard analytics',
      'Full business document details',
      'Priority setup help',
    ],
  },
]

export const paidSubscriptionPlans = subscriptionPlans.filter((plan): plan is SubscriptionPlanCard & { id: PaidPlan } => plan.id !== 'free')

export function getCurrentPlanCopy(plan: SubscriptionPlan, effectivePlan?: EffectiveSubscriptionPlan): { title: string; subtitle: string } {
  if (plan === 'starter') {
    return {
      title: 'Starter',
      subtitle: 'Starter is active. Upgrade to Pro for PDF export, sending, analytics, and full document setup.',
    }
  }

  if (plan === 'pro') {
    return {
      title: 'Pro',
      subtitle: 'Pro is active. Your full TailorDeck toolkit is available.',
    }
  }

  if (effectivePlan === 'trial') {
    return {
      title: 'Free Trial',
      subtitle: 'Full access is active during your 14-day trial.',
    }
  }

  return {
    title: 'Free',
    subtitle: '3 jobs included. Upgrade to Starter for unlimited job management.',
  }
}
