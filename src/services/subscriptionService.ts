import { supabase } from '../lib/supabase'
import type { SubscriptionBillingCycle, SubscriptionPlan } from '../lib/settingsTypes'
import { getFunctionInvokeErrorMessage, requireUserId, ServiceError } from './serviceHelpers'
import type { SubscriptionRow } from './types'

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

  void billingCycle
  const { data, error } = await supabase.rpc('start_free_trial_subscription').single<SubscriptionRow>()
  if (error) throw error
  return data
}

export async function startSubscriptionCheckout(params: {
  planName: Exclude<SubscriptionPlan, 'free'>
  billingCycle: SubscriptionBillingCycle
}): Promise<{ authorizationUrl: string; reference: string }> {
  const { data, error } = await supabase.functions.invoke('paystack-initialize-subscription', {
    body: params,
  })

  if (error) throw new ServiceError(await getFunctionInvokeErrorMessage(error, 'Unable to start Paystack checkout.'))

  const authorizationUrl = typeof data?.authorizationUrl === 'string' ? data.authorizationUrl : ''
  const reference = typeof data?.reference === 'string' ? data.reference : ''
  if (!authorizationUrl || !reference) throw new ServiceError('Unable to start Paystack checkout.')

  return { authorizationUrl, reference }
}

export async function verifySubscriptionPayment(reference: string): Promise<SubscriptionRow> {
  const { data, error } = await supabase.functions.invoke('paystack-verify-transaction', {
    body: { reference },
  })

  if (error) throw new ServiceError(await getFunctionInvokeErrorMessage(error, 'Unable to verify subscription payment.'))

  const subscription = data?.subscription as SubscriptionRow | undefined
  if (!subscription?.id) throw new ServiceError('Unable to verify subscription payment.')

  return subscription
}

export async function setCancelAtPeriodEnd(cancelAtPeriodEnd: boolean): Promise<SubscriptionRow> {
  const { data, error } = await supabase.functions.invoke('paystack-update-subscription-cancellation', {
    body: { cancelAtPeriodEnd },
  })
  if (error) throw new ServiceError(await getFunctionInvokeErrorMessage(error, 'Unable to update subscription cancellation.'))
  const subscription = data?.subscription as SubscriptionRow | undefined
  if (!subscription?.id) throw new ServiceError('Unable to update subscription cancellation.')
  return subscription
}

export async function checkFeatureAccess(featureKey: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_feature_access', {
    feature_key_value: featureKey,
  })
  if (error) throw error
  return data === true
}

export function isSubscriptionUsable(subscription: SubscriptionRow): boolean {
  if (subscription.status === 'expired' || subscription.status === 'past_due') return false
  if (subscription.plan_name !== 'free') return true

  const trialEnd = subscription.tester_trial_ends_at || subscription.trial_ends_at
  if (!trialEnd) return false
  return new Date(trialEnd).getTime() > Date.now()
}
