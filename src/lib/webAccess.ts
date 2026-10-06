import { Capacitor } from '@capacitor/core'

/**
 * TailorDeck is used through the Android app only. In a normal browser the site shows the marketing pages
 * (download from Google Play, privacy policy, terms, account deletion) instead of the app.
 * The full web app stays available for local development and automated browser tests (VITE_ALLOW_WEB_APP).
 */
export function isFullAppAllowed(): boolean {
  return Capacitor.isNativePlatform() || import.meta.env.DEV || import.meta.env.VITE_ALLOW_WEB_APP === 'true'
}

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.tailordeck'
export const SUPPORT_EMAIL = 'support@tailordeck.app'
