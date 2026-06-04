export type MeasurementUnit = 'cm' | 'inches'
export type MaterialQuality = 'Normal' | 'Original' | 'Fake' | 'High Standard'
export type ReminderLead = '1 day before' | '3 days before' | '1 week before'
export type SubscriptionPlan = 'free' | 'starter' | 'pro'
export type RingtoneOption = 'Classic Ring' | 'Soft Chime' | 'Pulse Tone'
export type NotificationBellOption = 'Standard Bell' | 'Soft Bell' | 'Sharp Bell'
export type SocialPlatform = 'Instagram' | 'Facebook' | 'TikTok'
export type DocumentTemplateOption = 'classic-wave'

export interface SocialHandle {
  id: string
  platform: SocialPlatform
  handle: string
}

export interface TailorSettings {
  profile: {
    fullName: string
    email: string
    phone: string
    avatarUrl: string
  }
  preferences: {
    measurementUnit: MeasurementUnit
    currencySymbol: string
    defaultMaterialQuality: MaterialQuality
  }
  reminders: {
    pushNotifications: boolean
    defaultReminder: ReminderLead
    ringtoneEnabled: boolean
    ringtone: RingtoneOption
    notificationBellEnabled: boolean
    notificationBell: NotificationBellOption
  }
  businessInfo: {
    shopName: string
    shopAddress: string
    businessPhone: string
    businessEmail: string
    website: string
    socialHandles: SocialHandle[]
  }
  brand: {
    name: string
    colors: [string, string, string]
    logoUrl: string
    signatureUrl: string
    documentTemplate: DocumentTemplateOption
    includeBusinessDetails: {
      phone: boolean
      email: boolean
      website: boolean
      social: boolean
      address: boolean
    }
  }
  subscription: {
    plan: SubscriptionPlan
  }
  updatedAt: string
}
