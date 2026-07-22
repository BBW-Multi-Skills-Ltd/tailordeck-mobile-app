import type { SubscriptionPlan } from '../../lib/settingsTypes'

export interface SubscriptionRow {
  id: string
  user_id: string
  plan_name: SubscriptionPlan
  status: 'active' | 'trialing' | 'expired' | 'cancelled' | 'past_due'
  trial_started_at: string | null
  trial_ends_at: string | null
  current_period_ends_at: string | null
  provider: string | null
  provider_customer_id: string | null
  provider_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface PlanFeatureRow {
  id: string
  plan_name: SubscriptionPlan
  feature_key: string
  is_enabled: boolean
}
