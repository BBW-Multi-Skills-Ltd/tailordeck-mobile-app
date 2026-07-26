import { loadTailorSettings, TAILOR_ONBOARDING_SYNC_PENDING_KEY } from '../lib/settings'
import type { SocialPlatform, TailorSettings } from '../lib/settingsTypes'
import { supabase } from '../lib/supabase'
import { updateBrandSettings } from './brandService'
import { updateBusinessProfile, updateSocialHandles } from './businessService'
import type { BusinessSocialHandleRow } from './types'

type SetupHandle = Pick<BusinessSocialHandleRow, 'platform' | 'handle'>

export async function syncOnboardingSettings(settings: TailorSettings): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return false

  const businessInfo = settings.businessInfo
  const includeDetails = settings.brand.includeBusinessDetails

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
