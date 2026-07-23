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
    },
    reminders: {
      pushNotifications: rows.preferences?.push_notifications ?? fallback.reminders.pushNotifications,
      defaultReminder: rows.preferences?.default_reminder || fallback.reminders.defaultReminder,
      ringtoneEnabled: rows.preferences?.ringtone_enabled ?? fallback.reminders.ringtoneEnabled,
      ringtone: rows.preferences?.ringtone || fallback.reminders.ringtone,
      notificationBellEnabled: rows.preferences?.notification_bell_enabled ?? fallback.reminders.notificationBellEnabled,
      notificationBell: rows.preferences?.notification_bell || fallback.reminders.notificationBell,
    },
    businessInfo: {
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
    },
    brand: {
      name: rows.business?.shop_name || fallback.brand.name,
      colors,
      logoUrl: rows.brand?.logo_url || fallback.brand.logoUrl,
      signatureUrl: rows.brand?.signature_url || fallback.brand.signatureUrl,
      documentTemplate: rows.brand?.document_template || fallback.brand.documentTemplate,
      includeBusinessDetails: {
        phone: rows.brand?.show_business_phone ?? fallback.brand.includeBusinessDetails.phone,
        email: rows.brand?.show_business_email ?? fallback.brand.includeBusinessDetails.email,
        website: rows.brand?.show_website ?? fallback.brand.includeBusinessDetails.website,
        social: rows.brand?.show_social ?? fallback.brand.includeBusinessDetails.social,
        address: rows.brand?.show_address ?? fallback.brand.includeBusinessDetails.address,
        cac: rows.brand?.show_cac ?? fallback.brand.includeBusinessDetails.cac,
      },
    },
    subscription: {
      plan: rows.subscription?.plan_name || fallback.subscription.plan,
      billingCycle: fallback.subscription.billingCycle,
      cancelAtPeriodEnd: fallback.subscription.cancelAtPeriodEnd,
    },
    updatedAt: rows.profile?.updated_at || fallback.updatedAt,
  }
}
