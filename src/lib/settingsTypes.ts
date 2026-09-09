import type { Reminder, ReminderUnit } from './reminderTypes'

export type MeasurementUnit = 'cm' | 'inches'
export type MaterialQuality = 'Normal' | 'Original' | 'Fake' | 'High Standard'
export type ReminderLead = Reminder
export type { ReminderUnit }
export type SubscriptionPlan = 'free' | 'starter' | 'pro'
export type SubscriptionBillingCycle = 'monthly' | 'yearly'
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
    darkMode: boolean
  }
  reminders: {
    pushNotifications: boolean
    defaultReminder: ReminderLead
    defaultCustomReminderValue: string
    defaultCustomReminderUnit: ReminderUnit
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
    cacRegistrationNumber: string
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
      cac: boolean
    }
  }
  subscription: {
    plan: SubscriptionPlan
    billingCycle: SubscriptionBillingCycle
    cancelAtPeriodEnd: boolean
  }
  updatedAt: string
}
