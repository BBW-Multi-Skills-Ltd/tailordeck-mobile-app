import type { MaterialQuality, MeasurementUnit, NotificationBellOption, ReminderLead, RingtoneOption, SocialPlatform, SubscriptionPlan } from '../lib/settingsTypes'
import type { ClientSex } from '../types/client'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type DbJobStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type DbNotificationType = 'deadline' | 'balance' | 'invoice' | 'account' | 'general'

export interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  phone_normalized: string | null
  avatar_url: string | null
  avatar_storage_path: string | null
  onboarding_complete: boolean | null
  account_status: string | null
  role: string | null
  created_at: string
  updated_at: string
}

export interface BusinessProfileRow {
  id: string
  user_id: string
  shop_name: string | null
  shop_address: string | null
  business_phone: string | null
  business_phone_normalized: string | null
  business_email: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface BusinessSocialHandleRow {
  id: string
  user_id: string
  platform: SocialPlatform
  handle: string
  created_at: string
  updated_at: string
}

export interface UserPreferencesRow {
  id: string
  user_id: string
  measurement_unit: MeasurementUnit
  default_material_quality: MaterialQuality | null
  push_notifications: boolean
  default_reminder: ReminderLead
  ringtone_enabled: boolean
  ringtone: RingtoneOption
  notification_bell_enabled: boolean
  notification_bell: NotificationBellOption
  created_at: string
  updated_at: string
}

export interface BrandSettingsRow {
  id: string
  user_id: string
  logo_url: string | null
  logo_storage_path: string | null
  signature_url: string | null
  signature_storage_path: string | null
  document_template: 'classic-wave'
  header_color: string | null
  body_color: string | null
  accent_color: string | null
  show_business_phone: boolean
  show_business_email: boolean
  show_website: boolean
  show_social: boolean
  show_address: boolean
  created_at: string
  updated_at: string
}

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

export interface ClientRow {
  id: string
  user_id: string
  name: string
  phone: string
  phone_normalized: string | null
  sex: ClientSex
  measurement_unit: MeasurementUnit
  last_job_date: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface JobRow {
  id: string
  user_id: string
  client_id: string | null
  client_name: string
  client_phone: string | null
  client_phone_normalized: string | null
  title: string | null
  order_mode: 'New Stitch' | 'Amendment / Repair'
  make_category: 'Body Wear' | 'Non-Body Item'
  order_scope: 'Single' | 'Couple' | 'Family'
  same_item_for_all: boolean | null
  item_type: string | null
  description: string | null
  amendment_issue_type: string | null
  amendment_area: string | null
  amendment_target: string | null
  amendment_description: string | null
  amendment_needs_materials: boolean | null
  amendment_part_name: string | null
  amendment_part_quantity: string | null
  material_type: string | null
  material_color: string | null
  material_yards: number | null
  material_quality: MaterialQuality | null
  material_source: 'Client is Providing Material' | 'I Am Getting It' | null
  charge_amount_kobo: number
  deposit_percent: number | null
  deposit_amount_kobo: number
  balance_amount_kobo: number | null
  total_expenses_kobo: number
  profit_kobo: number | null
  is_worth_it: boolean | null
  deadline_date: string | null
  deadline_time: string | null
  reminder: '1 day before' | '3 days before' | '1 week before' | 'none'
  status: DbJobStatus
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface JobPersonRow {
  id: string
  user_id: string
  job_id: string
  client_id: string | null
  name: string
  sex: 'Male' | 'Female' | 'Boy' | 'Girl'
  role: 'adult' | 'child'
  age: string | null
  item_type: string | null
  description: string | null
  is_primary: boolean
  measurement_kind: 'body' | 'non_body'
  quantity: string | null
  measurements: Record<string, number | string>
  measurement_unit: MeasurementUnit
  sort_order: number
  created_at: string
  updated_at: string
}

export interface JobExpenseRow {
  id: string
  user_id: string
  job_id: string
  name: string
  cost_amount_kobo: number
  created_at: string
  updated_at: string
}

export interface JobReferencePhotoRow {
  id: string
  user_id: string
  job_id: string
  storage_path: string
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
  sort_order: number
  created_at: string
}

export interface DocumentRow {
  id: string
  user_id: string
  job_id: string
  type: 'invoice' | 'receipt'
  document_number: string
  storage_path: string | null
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
  sent_via_whatsapp: boolean
  shared_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationRow {
  id: string
  user_id: string
  type: DbNotificationType
  title: string
  message: string
  action_url: string | null
  read_at: string | null
  scheduled_for: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface JobWithRelations extends JobRow {
  job_expenses?: JobExpenseRow[]
  job_persons?: JobPersonRow[]
  job_reference_photos?: JobReferencePhotoRow[]
}
