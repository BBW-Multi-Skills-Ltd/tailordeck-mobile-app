export type MeasurementUnit = 'cm' | 'inches'
export type MaterialQuality = 'Normal' | 'Original' | 'Fake' | 'High Standard'
export type ReminderLead = '1 day before' | '3 days before' | '1 week before'
export type SubscriptionPlan = 'free' | 'starter' | 'pro'

export interface TailorSettings {
  profile: {
    fullName: string
    email: string
    shopName: string
    phone: string
  }
  preferences: {
    measurementUnit: MeasurementUnit
    currencySymbol: string
    defaultMaterialQuality: MaterialQuality
  }
  reminders: {
    pushNotifications: boolean
    defaultReminder: ReminderLead
    dailySummary: boolean
  }
  businessInfo: {
    shopAddress: string
    businessPhone: string
    instagramHandle: string
  }
  brand: {
    name: string
    colors: [string, string, string]
    logoUrl: string
    signatureUrl: string
  }
  subscription: {
    plan: SubscriptionPlan
  }
  updatedAt: string
}

export const TAILOR_SETTINGS_KEY = 'tailordeck-settings'

export function getDefaultTailorSettings(): TailorSettings {
  return {
    profile: {
      fullName: 'Favour Tailor',
      email: 'favour@tailordeck.app',
      shopName: 'Elon Apparel',
      phone: '+234 801 234 5678',
    },
    preferences: {
      measurementUnit: 'cm',
      currencySymbol: '\u20A6',
      defaultMaterialQuality: 'Normal',
    },
    reminders: {
      pushNotifications: true,
      defaultReminder: '1 day before',
      dailySummary: false,
    },
    businessInfo: {
      shopAddress: '12 Allen Avenue, Ikeja, Lagos',
      businessPhone: '08012345678',
      instagramHandle: '@elonapparel',
    },
    brand: {
      name: 'Elon Apparel',
      colors: ['#7B1E37', '#F6ECF0', '#C9A84C'],
      logoUrl: '/branding/TailorDeck app logo for in app.png',
      signatureUrl: '',
    },
    subscription: {
      plan: 'free',
    },
    updatedAt: new Date().toISOString(),
  }
}

function normalizeSettings(value: Partial<TailorSettings>): TailorSettings {
  const defaults = getDefaultTailorSettings()
  return {
    profile: {
      fullName: value.profile?.fullName ?? defaults.profile.fullName,
      email: value.profile?.email ?? defaults.profile.email,
      shopName: value.profile?.shopName ?? defaults.profile.shopName,
      phone: value.profile?.phone ?? defaults.profile.phone,
    },
    preferences: {
      measurementUnit: value.preferences?.measurementUnit ?? defaults.preferences.measurementUnit,
      currencySymbol: value.preferences?.currencySymbol ?? defaults.preferences.currencySymbol,
      defaultMaterialQuality: value.preferences?.defaultMaterialQuality ?? defaults.preferences.defaultMaterialQuality,
    },
    reminders: {
      pushNotifications: value.reminders?.pushNotifications ?? defaults.reminders.pushNotifications,
      defaultReminder: value.reminders?.defaultReminder ?? defaults.reminders.defaultReminder,
      dailySummary: value.reminders?.dailySummary ?? defaults.reminders.dailySummary,
    },
    businessInfo: {
      shopAddress: value.businessInfo?.shopAddress ?? defaults.businessInfo.shopAddress,
      businessPhone: value.businessInfo?.businessPhone ?? defaults.businessInfo.businessPhone,
      instagramHandle: value.businessInfo?.instagramHandle ?? defaults.businessInfo.instagramHandle,
    },
    brand: {
      name: value.brand?.name ?? defaults.brand.name,
      colors: [
        value.brand?.colors?.[0] ?? defaults.brand.colors[0],
        value.brand?.colors?.[1] ?? defaults.brand.colors[1],
        value.brand?.colors?.[2] ?? defaults.brand.colors[2],
      ],
      logoUrl: value.brand?.logoUrl ?? defaults.brand.logoUrl,
      signatureUrl: value.brand?.signatureUrl ?? defaults.brand.signatureUrl,
    },
    subscription: {
      plan: value.subscription?.plan ?? defaults.subscription.plan,
    },
    updatedAt: value.updatedAt ?? defaults.updatedAt,
  }
}

export function loadTailorSettings(): TailorSettings {
  if (typeof window === 'undefined') return getDefaultTailorSettings()
  const raw = window.localStorage.getItem(TAILOR_SETTINGS_KEY)
  if (!raw) return getDefaultTailorSettings()

  try {
    const parsed = JSON.parse(raw) as Partial<TailorSettings>
    return normalizeSettings(parsed)
  } catch {
    return getDefaultTailorSettings()
  }
}

export function saveTailorSettings(settings: TailorSettings): TailorSettings {
  const next: TailorSettings = { ...settings, updatedAt: new Date().toISOString() }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TAILOR_SETTINGS_KEY, JSON.stringify(next))
  }
  return next
}
