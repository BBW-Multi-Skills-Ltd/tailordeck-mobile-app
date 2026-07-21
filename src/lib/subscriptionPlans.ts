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
    label: '14 Days Free Trial',
    badge: 'FREE TRIAL',
    price: { monthly: '\u20A60', yearly: '\u20A60' },
    suffix: { monthly: 'for 14 days', yearly: 'for 14 days' },
    subtitle: 'Try every TailorDeck tool before choosing a plan.',
    helper: 'Start free, then choose Starter or Pro when your trial ends.',
    cta: 'Get Started',
    features: [
      'All TailorDeck features for 14 days',
      'Create jobs and save clients automatically',
      'Invoice and receipt PDF preview',
      'Dashboard analytics',
      'Business and document setup',
      'Reminder alerts',
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

export function getCurrentPlanCopy(plan: SubscriptionPlan): { title: string; subtitle: string } {
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

  return {
    title: 'Free Trial',
    subtitle: 'Your trial includes every TailorDeck tool for 14 days.',
  }
}
