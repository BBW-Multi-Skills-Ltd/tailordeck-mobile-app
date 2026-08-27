import { supabase } from '../lib/supabase'
import type { SubscriptionBillingCycle, SubscriptionPlan } from '../lib/settingsTypes'
import { getFunctionInvokeErrorMessage, requireUserId, ServiceError } from './serviceHelpers'
import type { SubscriptionRow } from './types'

export type EffectiveSubscriptionPlan = SubscriptionPlan | 'trial' | 'inactive'

export type JobCreationEntitlement = {
  effective_plan: EffectiveSubscriptionPlan
  jobs_used: number
  job_limit: number | null
  can_create_job: boolean
}

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

export async function getJobCreationEntitlement(): Promise<JobCreationEntitlement> {
  const { data, error } = await supabase.rpc('get_job_creation_entitlement').maybeSingle<JobCreationEntitlement>()
  if (error) throw error
  if (!data) {
    return {
      effective_plan: 'inactive',
      jobs_used: 0,
      job_limit: null,
      can_create_job: false,
    }
  }
  return data
}

export function getJobCreationBlockedMessage(entitlement?: Pick<JobCreationEntitlement, 'effective_plan' | 'job_limit'> | null): string {
  if (entitlement?.effective_plan === 'free') {
    const limitLabel = typeof entitlement.job_limit === 'number' ? entitlement.job_limit : 3
    return `You've reached your Free plan limit. Upgrade to Starter to continue creating more than ${limitLabel} jobs.`
  }

  return 'Your current plan cannot create jobs right now. View plans to continue.'
}

export function isSubscriptionUsable(subscription: SubscriptionRow): boolean {
  if (subscription.plan_name === 'free') return subscription.status === 'active'
  if (subscription.status === 'expired' || subscription.status === 'past_due' || subscription.status === 'cancelled') return false
  return true
}

export function getTrialEnd(subscription: SubscriptionRow): string | null {
  const trialEnd = subscription.tester_trial_ends_at || subscription.trial_ends_at
  return trialEnd || null
}

export function isFreeTrialActive(subscription: SubscriptionRow, now = Date.now()): boolean {
  if (subscription.plan_name !== 'free' || subscription.status !== 'active') return false
  const trialEnd = getTrialEnd(subscription)
  if (!trialEnd) return false
  return new Date(trialEnd).getTime() > now
}

export function getEffectiveSubscriptionPlan(subscription: SubscriptionRow, now = Date.now()): EffectiveSubscriptionPlan {
  if (isFreeTrialActive(subscription, now)) return 'trial'
  if (subscription.plan_name === 'free' && subscription.status === 'active') return 'free'
  if (subscription.status !== 'active') return 'inactive'
  if (subscription.current_period_ends_at && new Date(subscription.current_period_ends_at).getTime() <= now) return 'inactive'
  return subscription.plan_name
}
