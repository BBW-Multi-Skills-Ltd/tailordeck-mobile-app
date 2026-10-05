import type { SubscriptionPlan } from '../../lib/settingsTypes'

export interface SubscriptionRow {
  id: string
  user_id: string
  plan_name: SubscriptionPlan
  status: 'active' | 'expired' | 'cancelled' | 'past_due'
  trial_ends_at: string | null
  free_started_at: string | null
  billing_cycle: 'monthly' | 'yearly'
  cancel_at_period_end: boolean
  current_period_ends_at: string | null
  payment_status: 'none' | 'pending' | 'paid' | 'failed'
  billing_provider?: 'internal' | 'google_play'
  google_play_product_id?: string | null
  google_play_purchase_token?: string | null
  google_play_subscription_state?: string | null
  is_tester: boolean | null
  tester_trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface PlanFeatureRow {
  id: string
  plan_name: SubscriptionPlan
  feature_key: string
  is_enabled: boolean
}
