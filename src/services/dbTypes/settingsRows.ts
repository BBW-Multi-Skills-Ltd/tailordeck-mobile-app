import type { MaterialQuality, MeasurementUnit, NotificationBellOption, ReminderLead, ReminderUnit, RingtoneOption } from '../../lib/settingsTypes'

export interface UserPreferencesRow {
  id: string
  user_id: string
  measurement_unit: MeasurementUnit
  default_material_quality: MaterialQuality | null
  dark_mode: boolean
  push_notifications: boolean
  default_reminder: ReminderLead
  default_custom_reminder_value: number | null
  default_custom_reminder_unit: ReminderUnit | null
  default_custom_reminder_minutes: number | null
  default_reminder_label: string | null
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
  show_cac: boolean
  created_at: string
  updated_at: string
}
