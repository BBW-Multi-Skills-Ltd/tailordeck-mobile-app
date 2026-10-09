import { Capacitor } from '@capacitor/core'

/**
 * TailorDeck is used through the Android app only. In a normal browser the site shows the marketing pages
 * (download from Google Play, privacy policy, terms, account deletion) instead of the app.
 * The full web app stays available for local development and automated browser tests (VITE_ALLOW_WEB_APP).
 */
export function isFullAppAllowed(): boolean {
  if (Capacitor.isNativePlatform()) return true
  if (import.meta.env.DEV) return !isMarketingPreviewInDev()
  // Staging and test builds (VITE_ALLOW_WEB_APP) can also switch to the website, so tests can reach /admin.
  return import.meta.env.VITE_ALLOW_WEB_APP === 'true' && !isMarketingPreviewInDev()
}

const MARKETING_PREVIEW_KEY = 'tailordeck-dev-marketing-preview'

/**
 * Local development shows the app by default. Open http://localhost:5173/?site=marketing to preview the
 * marketing website (remembered for this tab), and ?site=app to switch back.
 */
function isMarketingPreviewInDev(): boolean {
  try {
    const site = new URLSearchParams(window.location.search).get('site')
    if (site === 'marketing') window.sessionStorage.setItem(MARKETING_PREVIEW_KEY, 'true')
    if (site === 'app') window.sessionStorage.removeItem(MARKETING_PREVIEW_KEY)
    return window.sessionStorage.getItem(MARKETING_PREVIEW_KEY) === 'true'
  } catch {
    return false
  }
}

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.tailordeck'
export const SUPPORT_EMAIL = 'support@tailordeck.app'
