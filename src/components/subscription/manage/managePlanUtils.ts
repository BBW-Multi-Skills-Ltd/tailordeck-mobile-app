import { paidSubscriptionPlans, type PaidPlan } from '../../../lib/subscriptionPlans'
import type { SubscriptionPlan } from '../../../lib/settings'

export function formatRelativeDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getCurrentPlanMessage(isPaidPlan: boolean, cancelScheduled: boolean, trialEndDate: string): string {
  if (cancelScheduled && isPaidPlan) return 'Your workspace stays active until the billing period ends.'
  if (cancelScheduled) return `Your free trial stays active until ${trialEndDate}.`
  if (isPaidPlan) return 'Your workspace is active.'
  return 'Your free trial is active.'
}

export function getManagePlanOptions(plan: SubscriptionPlan) {
  if (plan === 'starter') return paidSubscriptionPlans.filter((item) => item.id === 'pro')
  if (plan === 'pro') return paidSubscriptionPlans.filter((item) => item.id === 'starter')
  return paidSubscriptionPlans
}

export function getDefaultManagePlan(plan: SubscriptionPlan): PaidPlan {
  if (plan === 'starter') return 'pro'
  if (plan === 'pro') return 'starter'
  return 'pro'
}

export function getManagePlanCta(currentPlan: SubscriptionPlan, nextPlan: PaidPlan): string {
  if (currentPlan === 'starter' && nextPlan === 'pro') return 'Upgrade to Pro'
  if (currentPlan === 'pro' && nextPlan === 'starter') return 'Switch to Starter'
  return `Choose ${nextPlan === 'pro' ? 'Pro' : 'Starter'}`
}
