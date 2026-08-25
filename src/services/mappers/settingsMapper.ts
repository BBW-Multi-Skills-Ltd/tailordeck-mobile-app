import { AVATAR_PLACEHOLDER, type TailorSettings } from '../../lib/settings'
import { getDefaultTailorSettings } from '../../lib/settingsDefaults'
import type { BrandSettingsRow, BusinessProfileRow, BusinessSocialHandleRow, ProfileRow, SubscriptionRow, UserPreferencesRow } from '../types'

export function mergeSettingsRows(rows: {
  profile?: ProfileRow | null
  business?: BusinessProfileRow | null
  handles?: BusinessSocialHandleRow[] | null
  preferences?: UserPreferencesRow | null
  brand?: BrandSettingsRow | null
  subscription?: SubscriptionRow | null
}): TailorSettings {
  const fallback = getDefaultTailorSettings()
  const colors: [string, string, string] = [
    rows.brand?.header_color || fallback.brand.colors[0],
    rows.brand?.body_color || fallback.brand.colors[1],
    rows.brand?.accent_color || fallback.brand.colors[2],
  ]
  const hasBrandSettings = Boolean(rows.brand)
  const businessInfo = {
    shopName: rows.business?.shop_name || fallback.businessInfo.shopName,
    shopAddress: rows.business?.shop_address || fallback.businessInfo.shopAddress,
    businessPhone: rows.business?.business_phone || fallback.businessInfo.businessPhone,
    businessEmail: rows.business?.business_email || fallback.businessInfo.businessEmail,
    website: rows.business?.website || fallback.businessInfo.website,
    cacRegistrationNumber: rows.business?.cac_registration_number || fallback.businessInfo.cacRegistrationNumber,
    socialHandles: (rows.handles ?? []).map((handle) => ({
      id: handle.id,
      platform: handle.platform,
      handle: handle.handle,
    })),
  }
  const fallbackIncludeBusinessDetails = {
    phone: Boolean(businessInfo.businessPhone) || fallback.brand.includeBusinessDetails.phone,
    email: Boolean(businessInfo.businessEmail) || fallback.brand.includeBusinessDetails.email,
    website: Boolean(businessInfo.website) || fallback.brand.includeBusinessDetails.website,
    social: businessInfo.socialHandles.length > 0 || fallback.brand.includeBusinessDetails.social,
    address: Boolean(businessInfo.shopAddress) || fallback.brand.includeBusinessDetails.address,
    cac: Boolean(businessInfo.cacRegistrationNumber) || fallback.brand.includeBusinessDetails.cac,
  }

  return {
    ...fallback,
    profile: {
      fullName: rows.profile?.full_name || fallback.profile.fullName,
      email: rows.profile?.email || fallback.profile.email,
      phone: rows.profile?.phone || fallback.profile.phone,
      avatarUrl: rows.profile?.avatar_url || AVATAR_PLACEHOLDER,
    },
    preferences: {
      measurementUnit: rows.preferences?.measurement_unit || fallback.preferences.measurementUnit,
      currencySymbol: '₦',
      defaultMaterialQuality: rows.preferences?.default_material_quality || fallback.preferences.defaultMaterialQuality,
      darkMode: rows.preferences?.dark_mode ?? fallback.preferences.darkMode,
    },
    reminders: {
      pushNotifications: rows.preferences?.push_notifications ?? fallback.reminders.pushNotifications,
      defaultReminder: rows.preferences?.default_reminder || fallback.reminders.defaultReminder,
      ringtoneEnabled: rows.preferences?.ringtone_enabled ?? fallback.reminders.ringtoneEnabled,
      ringtone: rows.preferences?.ringtone || fallback.reminders.ringtone,
      notificationBellEnabled: rows.preferences?.notification_bell_enabled ?? fallback.reminders.notificationBellEnabled,
      notificationBell: rows.preferences?.notification_bell || fallback.reminders.notificationBell,
    },
    businessInfo,
    brand: {
      name: rows.business?.shop_name || fallback.brand.name,
      colors,
      logoUrl: rows.brand?.logo_url || fallback.brand.logoUrl,
      signatureUrl: rows.brand?.signature_url || fallback.brand.signatureUrl,
      documentTemplate: rows.brand?.document_template || fallback.brand.documentTemplate,
      includeBusinessDetails: {
        phone: hasBrandSettings ? rows.brand?.show_business_phone ?? fallbackIncludeBusinessDetails.phone : fallbackIncludeBusinessDetails.phone,
        email: hasBrandSettings ? rows.brand?.show_business_email ?? fallbackIncludeBusinessDetails.email : fallbackIncludeBusinessDetails.email,
        website: hasBrandSettings ? rows.brand?.show_website ?? fallbackIncludeBusinessDetails.website : fallbackIncludeBusinessDetails.website,
        social: hasBrandSettings ? rows.brand?.show_social ?? fallbackIncludeBusinessDetails.social : fallbackIncludeBusinessDetails.social,
        address: hasBrandSettings ? rows.brand?.show_address ?? fallbackIncludeBusinessDetails.address : fallbackIncludeBusinessDetails.address,
        cac: hasBrandSettings ? rows.brand?.show_cac ?? fallbackIncludeBusinessDetails.cac : fallbackIncludeBusinessDetails.cac,
      },
    },
    subscription: {
      plan: rows.subscription?.plan_name || fallback.subscription.plan,
      billingCycle: rows.subscription?.billing_cycle || fallback.subscription.billingCycle,
      cancelAtPeriodEnd: rows.subscription?.cancel_at_period_end ?? fallback.subscription.cancelAtPeriodEnd,
    },
    updatedAt: rows.profile?.updated_at || fallback.updatedAt,
  }
}
