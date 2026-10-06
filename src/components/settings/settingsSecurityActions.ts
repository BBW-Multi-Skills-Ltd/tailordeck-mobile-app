import type { SubscriptionPlan } from '../../lib/settings'

export function getSecurityDangerMessage(kind: 'deactivate' | 'delete', plan?: SubscriptionPlan): string {
  if (kind === 'deactivate') {
    return 'Your account will be paused and you will be signed out. Your shop data stays stored, and you can reactivate by signing in again.'
  }

  const message =
    'Your account will be locked immediately and scheduled for permanent deletion in 14 days. During that time, you can sign in and restore it. After 14 days, your shop, clients, jobs, measurements, documents, photos, logo, signature, and settings may be permanently removed.'
  if (plan !== 'starter' && plan !== 'pro') return message

  const planLabel = plan === 'pro' ? 'Pro' : 'Starter'
  return `${message} Your ${planLabel} subscription will be cancelled in Google Play so you are not charged again. Payments already made are not refunded. If you restore your account, you can resubscribe from Subscription.`
}
