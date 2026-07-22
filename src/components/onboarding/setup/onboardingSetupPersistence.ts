import {
  loadTailorSettings,
  saveTailorSettings,
  type SocialHandle,
  type SocialPlatform,
} from '../../../lib/settings'
import { onboardingSocialPlatforms } from './onboardingSetupConfig'

export type OnboardingSetupDraft = {
  businessAddress: string
  businessEmail: string
  businessName: string
  businessPhone: string
  cacRegistrationNumber: string
  logoUrl: string
  signatureUrl: string
  socialHandles: Record<SocialPlatform, string>
  website: string
}

export function getInitialSocialHandles(): Record<SocialPlatform, string> {
  const handles = loadTailorSettings().businessInfo.socialHandles
  return {
    Instagram: handles.find((item) => item.platform === 'Instagram')?.handle ?? '',
    Facebook: handles.find((item) => item.platform === 'Facebook')?.handle ?? '',
    TikTok: handles.find((item) => item.platform === 'TikTok')?.handle ?? '',
  }
}

export function persistOnboardingSetup(draft: OnboardingSetupDraft): void {
  const current = loadTailorSettings()
  const normalizedBusinessName = draft.businessName.trim() || current.businessInfo.shopName
  const normalizedSocialHandles = normalizeSocialHandles(draft.socialHandles)

  saveTailorSettings({
    ...current,
    preferences: {
      ...current.preferences,
      measurementUnit: 'inches',
    },
    businessInfo: {
      ...current.businessInfo,
      shopName: normalizedBusinessName,
      shopAddress: draft.businessAddress.trim(),
      businessPhone: draft.businessPhone.trim(),
      businessEmail: draft.businessEmail.trim(),
      website: draft.website.trim(),
      cacRegistrationNumber: draft.cacRegistrationNumber.trim(),
      socialHandles: normalizedSocialHandles,
    },
    brand: {
      ...current.brand,
      name: normalizedBusinessName || current.brand.name,
      logoUrl: draft.logoUrl,
      signatureUrl: draft.signatureUrl,
      includeBusinessDetails: {
        ...current.brand.includeBusinessDetails,
        phone: Boolean(draft.businessPhone.trim()),
        email: Boolean(draft.businessEmail.trim()),
        website: Boolean(draft.website.trim()),
        social: normalizedSocialHandles.length > 0,
        address: Boolean(draft.businessAddress.trim()),
        cac: Boolean(draft.cacRegistrationNumber.trim()),
      },
    },
    updatedAt: new Date().toISOString(),
  })
}

function normalizeSocialHandles(socialHandles: Record<SocialPlatform, string>): SocialHandle[] {
  return onboardingSocialPlatforms
    .map((platform) => ({ platform, handle: socialHandles[platform].trim() }))
    .filter((item) => item.handle)
    .map((item) => ({ id: `${item.platform.toLowerCase()}-${Date.now()}`, platform: item.platform, handle: item.handle }))
}
