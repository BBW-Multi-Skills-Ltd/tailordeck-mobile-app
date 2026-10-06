import type { SubscriptionPlan } from '../../lib/settings'

export function getSecurityDangerMessage(kind: 'deactivate' | 'delete', plan?: SubscriptionPlan): string {
  const isPaidPlan = plan === 'starter' || plan === 'pro'
  const planLabel = plan === 'pro' ? 'Pro' : 'Starter'

  if (kind === 'deactivate') {
    const message =
      'Your account will be paused and you will be signed out. Your shop data stays stored, and you can reactivate by signing in again.'
    // Deactivation is a temporary pause, so billing is not cancelled automatically; tell paying users how to stop it.
    return isPaidPlan
      ? `${message} Your ${planLabel} subscription keeps renewing in Google Play while your account is paused. To stop payments, cancel it in Play Store > Payments & subscriptions.`
      : message
  }

  const message =
    'Your account will be locked immediately and scheduled for permanent deletion in 14 days. During that time, you can sign in and restore it. After 14 days, your shop, clients, jobs, measurements, documents, photos, logo, signature, and settings may be permanently removed.'
  if (!isPaidPlan) return message
  return `${message} Your ${planLabel} subscription will be cancelled in Google Play so you are not charged again. Payments already made are not refunded. If you restore your account, you can resubscribe from Subscription.`
}
