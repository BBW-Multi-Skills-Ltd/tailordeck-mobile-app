import { loadTailorSettings, TAILOR_ONBOARDING_SYNC_PENDING_KEY } from '../lib/settings'
import type { SocialPlatform, TailorSettings } from '../lib/settingsTypes'
import { supabase } from '../lib/supabase'
import { updateBrandSettings, uploadLogo, uploadSignature } from './brandService'
import { updateBusinessProfile, updateSocialHandles } from './businessService'
import type { BusinessSocialHandleRow } from './types'
import { getDefaultTailorSettings } from '../lib/settingsDefaults'

type SetupHandle = Pick<BusinessSocialHandleRow, 'platform' | 'handle'>

export async function syncOnboardingSettings(settings: TailorSettings): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return false

  const businessInfo = settings.businessInfo
  const includeDetails = settings.brand.includeBusinessDetails
  const fallbackBrand = getDefaultTailorSettings().brand

  await syncBrandAssets(settings, fallbackBrand.logoUrl)

  await Promise.all([
    updateBusinessProfile({
      shop_name: cleanText(businessInfo.shopName),
      shop_address: cleanText(businessInfo.shopAddress),
      business_phone: cleanText(businessInfo.businessPhone, ['+234']),
      business_email: cleanText(businessInfo.businessEmail),
      website: cleanText(businessInfo.website, ['https://']),
      cac_registration_number: cleanText(businessInfo.cacRegistrationNumber),
    }),
    updateBrandSettings({
      show_business_phone: includeDetails.phone,
      show_business_email: includeDetails.email,
      show_website: includeDetails.website,
      show_social: includeDetails.social,
      show_address: includeDetails.address,
      show_cac: includeDetails.cac,
    }),
    updateSocialHandles(toSetupHandles(settings)),
  ])

  return true
}

export async function syncPendingOnboardingSettings(settings = loadTailorSettings()): Promise<boolean> {
  if (!hasPendingOnboardingSync()) return false

  const synced = await syncOnboardingSettings(settings)
  if (synced) clearPendingOnboardingSync()
  return synced
}

function hasPendingOnboardingSync(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(TAILOR_ONBOARDING_SYNC_PENDING_KEY) === 'true'
}

function clearPendingOnboardingSync(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TAILOR_ONBOARDING_SYNC_PENDING_KEY)
}

function toSetupHandles(settings: TailorSettings): SetupHandle[] {
  return settings.businessInfo.socialHandles
    .map((item) => ({
      platform: item.platform as SocialPlatform,
      handle: item.handle.trim().replace(/^@+/, ''),
    }))
    .filter((item) => item.handle)
}

function cleanText(value: string, placeholders: string[] = []): string {
  const trimmed = value.trim()
  return placeholders.includes(trimmed) ? '' : trimmed
}

async function syncBrandAssets(settings: TailorSettings, fallbackLogoUrl: string): Promise<void> {
  const uploads: Array<Promise<unknown>> = []

  if (isDataImageUrl(settings.brand.logoUrl) && settings.brand.logoUrl !== fallbackLogoUrl) {
    const logoFile = dataImageUrlToFile(settings.brand.logoUrl, 'onboarding-logo')
    if (logoFile) uploads.push(uploadLogo(logoFile))
  }

  if (isDataImageUrl(settings.brand.signatureUrl)) {
    const signatureFile = dataImageUrlToFile(settings.brand.signatureUrl, 'onboarding-signature')
    if (signatureFile) uploads.push(uploadSignature(signatureFile))
  }

  await Promise.all(uploads)
}

function isDataImageUrl(value: string): boolean {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(value)
}

function dataImageUrlToFile(dataUrl: string, baseName: string): File | null {
  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i)
  if (!match) return null

  const [, mimeType, base64] = match
  const extension = mimeType.split('/')[1] || 'png'
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  return new File([bytes], `${baseName}.${extension}`, { type: mimeType })
}
