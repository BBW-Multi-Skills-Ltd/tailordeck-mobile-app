import type { TailorSettings } from '../lib/settingsTypes'
import { getBrandSettings, updateBrandSettings } from './brandService'
import { getBusinessProfile, getSocialHandles, updateBusinessProfile, updateSocialHandles } from './businessService'
import { mergeSettingsRows } from './mappers/settingsMapper'
import { getPreferences, updatePreferences } from './preferencesService'
import { getProfile, updateProfile } from './profileService'
import { getSubscription } from './subscriptionService'
import type { BusinessSocialHandleRow } from './types'

export async function getSettings(): Promise<TailorSettings> {
  const [profile, business, handles, preferences, brand, subscription] = await Promise.all([
    getProfile(),
    getBusinessProfile(),
    getSocialHandles(),
    getPreferences(),
    getBrandSettings(),
    getSubscription(),
  ])
  return mergeSettingsRows({ profile, business, handles, preferences, brand, subscription })
}

export async function saveProfileSettings(settings: TailorSettings) {
  return updateProfile({ full_name: settings.profile.fullName, email: settings.profile.email, phone: settings.profile.phone, avatar_url: settings.profile.avatarUrl })
}

export async function saveBusinessSettings(settings: TailorSettings) {
  const socialRows: Array<Pick<BusinessSocialHandleRow, 'platform' | 'handle'>> = settings.businessInfo.socialHandles.map((handle) => ({ platform: handle.platform, handle: handle.handle }))
  const [business, handles] = await Promise.all([
    updateBusinessProfile({
      shop_name: settings.businessInfo.shopName,
      shop_address: settings.businessInfo.shopAddress,
      business_phone: settings.businessInfo.businessPhone,
      business_email: settings.businessInfo.businessEmail,
      website: settings.businessInfo.website,
    }),
    updateSocialHandles(socialRows),
  ])
  return { business, handles }
}

export async function savePreferenceSettings(settings: TailorSettings) {
  return updatePreferences({
    measurement_unit: settings.preferences.measurementUnit,
    default_material_quality: settings.preferences.defaultMaterialQuality,
  })
}

export async function saveReminderSettings(settings: TailorSettings) {
  return updatePreferences({
    push_notifications: settings.reminders.pushNotifications,
    default_reminder: settings.reminders.defaultReminder,
    ringtone_enabled: settings.reminders.ringtoneEnabled,
    ringtone: settings.reminders.ringtone,
    notification_bell_enabled: settings.reminders.notificationBellEnabled,
    notification_bell: settings.reminders.notificationBell,
  })
}

export async function saveBrandSettings(settings: TailorSettings) {
  return updateBrandSettings({
    logo_url: settings.brand.logoUrl,
    signature_url: settings.brand.signatureUrl,
    document_template: settings.brand.documentTemplate,
    header_color: settings.brand.colors[0],
    body_color: settings.brand.colors[1],
    accent_color: settings.brand.colors[2],
    show_business_phone: settings.brand.includeBusinessDetails.phone,
    show_business_email: settings.brand.includeBusinessDetails.email,
    show_website: settings.brand.includeBusinessDetails.website,
    show_social: settings.brand.includeBusinessDetails.social,
    show_address: settings.brand.includeBusinessDetails.address,
  })
}
