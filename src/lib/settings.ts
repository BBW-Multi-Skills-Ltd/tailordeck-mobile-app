import { getDefaultTailorSettings, TAILOR_SETTINGS_KEY } from './settingsDefaults'
import { normalizeSettings } from './settingsNormalize'
import type { TailorSettings } from './settingsTypes'

export { AVATAR_PLACEHOLDER, TAILOR_SETTINGS_KEY, TAILOR_SIGNUP_PREFILL_KEY, getDefaultTailorSettings } from './settingsDefaults'
export type {
  DocumentTemplateOption,
  MaterialQuality,
  MeasurementUnit,
  NotificationBellOption,
  ReminderLead,
  RingtoneOption,
  SocialHandle,
  SocialPlatform,
  SubscriptionPlan,
  TailorSettings,
} from './settingsTypes'

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
    window.dispatchEvent(new Event('tailordeck-settings-updated'))
  }
  return next
}
