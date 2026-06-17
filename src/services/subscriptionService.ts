import { supabase } from '../lib/supabase'
import type { SubscriptionPlan } from '../lib/settingsTypes'
import type { PlanFeatureRow, SubscriptionRow } from './types'
import { requireUserId } from './serviceHelpers'

export async function getSubscription(): Promise<SubscriptionRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle<SubscriptionRow>()
  if (error) throw error
  return data
}

export async function selectSubscriptionPlan(planName: SubscriptionPlan): Promise<SubscriptionRow> {
  const userId = await requireUserId()
  const now = new Date()
  const trialEndsAt = planName === 'free' ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() : null
  const payload = {
    user_id: userId,
    plan_name: planName,
    status: 'active',
    trial_ends_at: trialEndsAt,
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

export async function checkFeatureAccess(featureKey: string): Promise<boolean> {
  const subscription = await getSubscription()
  if (!subscription) return false
  const { data, error } = await supabase
    .from('plan_features')
    .select('*')
    .eq('plan_name', subscription.plan_name)
    .eq('feature_key', featureKey)
    .maybeSingle<PlanFeatureRow>()
  if (error) throw error
  return Boolean(data?.is_enabled)
}

