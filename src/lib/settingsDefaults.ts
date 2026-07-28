import type { TailorSettings } from './settingsTypes'

export const TAILOR_SETTINGS_KEY = 'tailordeck-settings'
export const TAILOR_SIGNUP_PREFILL_KEY = 'tailordeck-signup-profile'
export const TAILOR_ONBOARDING_SYNC_PENDING_KEY = 'tailordeck-onboarding-sync-pending'
export const TAILOR_ONBOARDING_SETUP_SKIPPED_KEY = 'tailordeck-onboarding-setup-skipped'
export const AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='60' fill='%23F2EEE9'/%3E%3Ccircle cx='60' cy='44' r='20' fill='%23C9A84C'/%3E%3Cpath d='M24 104C24 82.9 41.2 66 62.3 66h-4.6C36.6 66 19.4 82.9 19.4 104V120H100.6V104C100.6 82.9 83.4 66 62.3 66z' fill='%237B1E37'/%3E%3Ccircle cx='60' cy='60' r='58' fill='none' stroke='%23E8E0D8' stroke-width='4'/%3E%3C/svg%3E"

type SignupPrefill = {
  fullName: string
  email: string
  shopName: string
}

function loadSignupPrefill(): SignupPrefill {
  const fallback: SignupPrefill = {
    fullName: '',
    email: '',
    shopName: '',
  }

  if (typeof window === 'undefined') return fallback

  const raw = window.localStorage.getItem(TAILOR_SIGNUP_PREFILL_KEY)
  if (!raw) return fallback

  try {
    const parsed = JSON.parse(raw) as Partial<SignupPrefill>
    return {
      fullName: parsed.fullName?.trim() || fallback.fullName,
      email: parsed.email?.trim() || fallback.email,
      shopName: parsed.shopName?.trim() || fallback.shopName,
    }
  } catch {
    return fallback
  }
}

export function getDefaultTailorSettings(): TailorSettings {
  const signup = loadSignupPrefill()

  return {
    profile: {
      fullName: signup.fullName || 'Your Name',
      email: signup.email || 'your@email.com',
      phone: '+234',
      avatarUrl: AVATAR_PLACEHOLDER,
    },
    preferences: {
      measurementUnit: 'inches',
      currencySymbol: '\u20A6',
      defaultMaterialQuality: 'Normal',
    },
    reminders: {
      pushNotifications: true,
      defaultReminder: '1 day before',
      ringtoneEnabled: true,
      ringtone: 'Classic Ring',
      notificationBellEnabled: true,
      notificationBell: 'Standard Bell',
    },
    businessInfo: {
      shopName: signup.shopName || '',
      shopAddress: '',
      businessPhone: '+234',
      businessEmail: '',
      website: 'https://',
      cacRegistrationNumber: '',
      socialHandles: [],
    },
    brand: {
      name: signup.shopName || 'Your Business',
      colors: ['#7B1E37', '#F6ECF0', '#C9A84C'],
      logoUrl: '/branding/TailorDeck app logo for in app.png',
      signatureUrl: '',
      documentTemplate: 'classic-wave',
      includeBusinessDetails: {
        phone: true,
        email: true,
        website: false,
        social: true,
        address: true,
        cac: false,
      },
    },
    subscription: {
      plan: 'free',
      billingCycle: 'monthly',
      cancelAtPeriodEnd: false,
    },
    updatedAt: new Date().toISOString(),
  }
}
