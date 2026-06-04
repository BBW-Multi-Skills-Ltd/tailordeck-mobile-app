import { getDefaultTailorSettings } from './settingsDefaults'
import type { DocumentTemplateOption, TailorSettings } from './settingsTypes'

export function normalizeSettings(value: Partial<TailorSettings>): TailorSettings {
  const defaults = getDefaultTailorSettings()
  const legacyValue = value as Partial<TailorSettings> & { profile?: { shopName?: string } }
  const legacyBrandValue = value as Partial<TailorSettings> & {
    brand?: { invoiceTemplate?: string; receiptTemplate?: string; documentTemplate?: string }
  }

  return {
    profile: {
      fullName: value.profile?.fullName ?? defaults.profile.fullName,
      email: value.profile?.email ?? defaults.profile.email,
      phone: normalizeProfilePhone(value.profile?.phone ?? defaults.profile.phone),
      avatarUrl: value.profile?.avatarUrl ?? defaults.profile.avatarUrl,
    },
    preferences: {
      measurementUnit: value.preferences?.measurementUnit ?? defaults.preferences.measurementUnit,
      currencySymbol: value.preferences?.currencySymbol ?? defaults.preferences.currencySymbol,
      defaultMaterialQuality: value.preferences?.defaultMaterialQuality ?? defaults.preferences.defaultMaterialQuality,
    },
    reminders: {
      pushNotifications: value.reminders?.pushNotifications ?? defaults.reminders.pushNotifications,
      defaultReminder: value.reminders?.defaultReminder ?? defaults.reminders.defaultReminder,
      ringtoneEnabled: value.reminders?.ringtoneEnabled ?? defaults.reminders.ringtoneEnabled,
      ringtone: value.reminders?.ringtone ?? defaults.reminders.ringtone,
      notificationBellEnabled: value.reminders?.notificationBellEnabled ?? defaults.reminders.notificationBellEnabled,
      notificationBell: value.reminders?.notificationBell ?? defaults.reminders.notificationBell,
    },
    businessInfo: {
      shopName: value.businessInfo?.shopName ?? legacyValue.profile?.shopName ?? defaults.businessInfo.shopName,
      shopAddress: value.businessInfo?.shopAddress ?? defaults.businessInfo.shopAddress,
      businessPhone: normalizeBusinessPhone(value.businessInfo?.businessPhone ?? defaults.businessInfo.businessPhone),
      businessEmail: value.businessInfo?.businessEmail ?? defaults.businessInfo.businessEmail,
      website: value.businessInfo?.website ?? defaults.businessInfo.website,
      socialHandles: normalizeSocialHandles(value, defaults),
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
      documentTemplate:
        (legacyBrandValue.brand?.documentTemplate as DocumentTemplateOption | undefined) ??
        (legacyBrandValue.brand?.invoiceTemplate ? 'classic-wave' : undefined) ??
        (legacyBrandValue.brand?.receiptTemplate ? 'classic-wave' : undefined) ??
        defaults.brand.documentTemplate,
      includeBusinessDetails: {
        phone: value.brand?.includeBusinessDetails?.phone ?? defaults.brand.includeBusinessDetails.phone,
        email: value.brand?.includeBusinessDetails?.email ?? defaults.brand.includeBusinessDetails.email,
        website: value.brand?.includeBusinessDetails?.website ?? defaults.brand.includeBusinessDetails.website,
        social: value.brand?.includeBusinessDetails?.social ?? defaults.brand.includeBusinessDetails.social,
        address: value.brand?.includeBusinessDetails?.address ?? defaults.brand.includeBusinessDetails.address,
      },
    },
    subscription: {
      plan: value.subscription?.plan ?? defaults.subscription.plan,
    },
    updatedAt: value.updatedAt ?? defaults.updatedAt,
  }
}

function normalizeProfilePhone(phone: string): string {
  const normalizedPhoneDigits = phone.replace(/\D/g, '')
  const normalizedPhoneLocal =
    normalizedPhoneDigits.startsWith('234')
      ? normalizedPhoneDigits.slice(3)
      : normalizedPhoneDigits.startsWith('0')
        ? normalizedPhoneDigits.slice(1)
        : normalizedPhoneDigits

  if (normalizedPhoneDigits.length === 0) return '+234'
  if (normalizedPhoneDigits.startsWith('234')) return `+${normalizedPhoneDigits}`
  return `+234${normalizedPhoneLocal}`
}

function normalizeBusinessPhone(phone: string): string {
  const businessDigits = phone.replace(/\D/g, '')
  const businessLocal =
    businessDigits.startsWith('234')
      ? businessDigits.slice(3)
      : businessDigits.startsWith('0')
        ? businessDigits.slice(1)
        : businessDigits

  return businessDigits.length === 0 ? '+234' : `+234${businessLocal}`
}

function normalizeSocialHandles(value: Partial<TailorSettings>, defaults: TailorSettings): TailorSettings['businessInfo']['socialHandles'] {
  const legacyBusiness = value.businessInfo as Partial<TailorSettings['businessInfo']> & { instagramHandle?: string } | undefined

  if (value.businessInfo?.socialHandles?.length) {
    return value.businessInfo.socialHandles
      .filter((item) => item?.platform && item?.handle)
      .map((item, index) => ({
        id: item.id || `social-${item.platform.toLowerCase()}-${index + 1}`,
        platform: item.platform,
        handle: item.handle,
      }))
  }

  if (legacyBusiness?.instagramHandle) {
    return [{ id: 'social-instagram-legacy', platform: 'Instagram', handle: legacyBusiness.instagramHandle }]
  }

  return defaults.businessInfo.socialHandles
}
