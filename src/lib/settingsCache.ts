import { getDefaultTailorSettings, TAILOR_ONBOARDING_SYNC_PENDING_KEY, TAILOR_SETTINGS_KEY } from './settingsDefaults'
import { normalizeSettings } from './settingsNormalize'
import type { TailorSettings } from './settingsTypes'

// Signed-in settings come from the server (React Query, see useSettingsQuery). This cache only lets the
// header, Home and More paint instantly on the next launch. It is tagged with the user id, so another
// account on the same phone never sees it, and it is wiped on sign-out (clearUserLocalData).

const SETTINGS_CACHE_KEY = 'tailordeck-settings-cache'

// Keys that hold data of the signed-in user (cleared on sign-out). Theme and onboarding-stage keys stay.
const USER_DATA_KEYS = [SETTINGS_CACHE_KEY, 'tailordeck-new-job-autosave']
const USER_DATA_PREFIXES = ['tailordeck:signed-url:']

type CachedSettings = { userId: string; settings: TailorSettings }

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function readCachedSettings(userId: string | undefined): TailorSettings | undefined {
  if (!userId) return undefined
  try {
    const raw = storage()?.getItem(SETTINGS_CACHE_KEY)
    if (!raw) return undefined
    const cached = JSON.parse(raw) as Partial<CachedSettings>
    if (cached.userId !== userId || !cached.settings) return undefined
    return normalizeSettings(cached.settings)
  } catch {
    return undefined
  }
}

export function writeCachedSettings(userId: string | undefined, settings: TailorSettings): void {
  if (!userId) return
  try {
    storage()?.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ userId, settings } satisfies CachedSettings))
  } catch {
    // Storage full or unavailable: the app still works, it just paints from the server next time.
  }
}

/** Settings to show while the server copy is not loaded yet and nothing is cached. */
export function fallbackSettings(): TailorSettings {
  return getDefaultTailorSettings()
}

/**
 * Removes the signed-in user's data from this phone: cached settings, signed photo links, the unsaved New Job
 * draft, and the onboarding draft once it has been synced to the account.
 */
export function clearUserLocalData(): void {
  const clearFrom = (store: Storage | null) => {
    if (!store) return
    const keys: string[] = []
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index)
      if (key) keys.push(key)
    }
    for (const key of keys) {
      if (USER_DATA_KEYS.includes(key) || USER_DATA_PREFIXES.some((prefix) => key.startsWith(prefix))) store.removeItem(key)
    }
  }
  clearFrom(storage())
  try {
    clearFrom(typeof window === 'undefined' ? null : window.sessionStorage)
  } catch {
    // ignore
  }
  // The onboarding draft is only needed until it has been saved to the account.
  const local = storage()
  if (local && local.getItem(TAILOR_ONBOARDING_SYNC_PENDING_KEY) !== 'true') local.removeItem(TAILOR_SETTINGS_KEY)
}
