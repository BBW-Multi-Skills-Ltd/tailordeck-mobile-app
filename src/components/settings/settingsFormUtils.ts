import type { TailorSettings } from '../../lib/settings'

export function normalizeNigeriaPhoneInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, '')
  if (!digitsOnly || digitsOnly === '234') return ''
  const normalizedLocal = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly
  return `+234${normalizedLocal}`
}

export function normalizeWebsiteInput(value: string): string {
  const normalized = value.trim().replace(/^https?:\/\//, '')
  if (!normalized) return ''
  return `https://${normalized}`
}

export function getSettingsLocalParts(settings: TailorSettings) {
  return {
    businessPhoneLocalPart: settings.businessInfo.businessPhone.replace(/^\+234/, '').replace(/\D/g, ''),
    profilePhoneLocalPart: settings.profile.phone.replace(/^\+234/, '').replace(/\D/g, ''),
    websiteLocalPart: settings.businessInfo.website.replace(/^https?:\/\//, ''),
  }
}
