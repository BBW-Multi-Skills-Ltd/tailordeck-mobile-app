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
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ plan_name: planName, status: 'active', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('*')
    .single<SubscriptionRow>()
  if (error) throw error
  return data
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
  return Boolean(data?.enabled)
}

