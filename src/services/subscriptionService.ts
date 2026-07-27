import { supabase } from '../lib/supabase'
import type { SubscriptionBillingCycle, SubscriptionPlan } from '../lib/settingsTypes'
import { requireUserId, ServiceError } from './serviceHelpers'
import type { PlanFeatureRow, SubscriptionRow } from './types'

export async function getSubscription(): Promise<SubscriptionRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle<SubscriptionRow>()
  if (error) throw error
  return data
}

export async function selectSubscriptionPlan(
  planName: SubscriptionPlan,
  billingCycle: SubscriptionBillingCycle = 'monthly',
): Promise<SubscriptionRow> {
  if (planName !== 'free') {
    throw new ServiceError('Paid plans must be activated through Paystack checkout.')
  }

  const userId = await requireUserId()
  const now = new Date()
  const trialEndsAt = planName === 'free' ? getRelativeDateIso(now, 14) : null
  const currentPeriodEndsAt = planName === 'free' ? trialEndsAt : getRelativeDateIso(now, billingCycle === 'yearly' ? 365 : 30)
  const payload = {
    user_id: userId,
    plan_name: planName,
    status: 'active',
    billing_cycle: billingCycle,
    cancel_at_period_end: false,
    trial_ends_at: trialEndsAt,
    current_period_ends_at: currentPeriodEndsAt,
    updated_at: now.toISOString(),
  }

  const { data: updated, error: updateError } = await supabase
    .from('subscriptions')
    .update(payload)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle<SubscriptionRow>()
  if (updateError) throw updateError
  if (updated) return updated

  const { data: inserted, error: insertError } = await supabase
    .from('subscriptions')
    .insert(payload)
    .select('*')
    .single<SubscriptionRow>()
  if (insertError) throw insertError
  return inserted
}

export async function startSubscriptionCheckout(params: {
  planName: Exclude<SubscriptionPlan, 'free'>
  billingCycle: SubscriptionBillingCycle
}): Promise<{ authorizationUrl: string; reference: string }> {
  const { data, error } = await supabase.functions.invoke('paystack-initialize-subscription', {
    body: params,
  })

  if (error) throw error

  const authorizationUrl = typeof data?.authorizationUrl === 'string' ? data.authorizationUrl : ''
  const reference = typeof data?.reference === 'string' ? data.reference : ''
  if (!authorizationUrl || !reference) throw new ServiceError('Unable to start Paystack checkout.')

  return { authorizationUrl, reference }
}

export async function verifySubscriptionPayment(reference: string): Promise<SubscriptionRow> {
  const { data, error } = await supabase.functions.invoke('paystack-verify-transaction', {
    body: { reference },
  })

  if (error) throw error

  const subscription = data?.subscription as SubscriptionRow | undefined
  if (!subscription?.id) throw new ServiceError('Unable to verify subscription payment.')

  return subscription
}

export async function setCancelAtPeriodEnd(cancelAtPeriodEnd: boolean): Promise<SubscriptionRow> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: cancelAtPeriodEnd,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single<SubscriptionRow>()
  if (error) throw error
  return data
}

export async function checkFeatureAccess(featureKey: string): Promise<boolean> {
  const subscription = await getSubscription()
  if (!subscription) return false
  if (!isSubscriptionUsable(subscription)) return false

  const { data, error } = await supabase
    .from('plan_features')
    .select('*')
    .eq('plan_name', subscription.plan_name)
    .eq('feature_key', featureKey)
    .maybeSingle<PlanFeatureRow>()
  if (error) throw error
  return Boolean(data?.is_enabled)
}

export function isSubscriptionUsable(subscription: SubscriptionRow): boolean {
  if (subscription.status === 'expired' || subscription.status === 'past_due') return false
  if (subscription.plan_name !== 'free') return true

  const trialEnd = subscription.tester_trial_ends_at || subscription.trial_ends_at
  if (!trialEnd) return false
  return new Date(trialEnd).getTime() > Date.now()
}

function getRelativeDateIso(from: Date, daysFromNow: number): string {
  const next = new Date(from)
  next.setDate(next.getDate() + daysFromNow)
  return next.toISOString()
}
