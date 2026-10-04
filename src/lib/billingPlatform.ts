import { Capacitor } from '@capacitor/core'

export function isNativeAndroidApp(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function isGooglePlayBillingPending(): boolean {
  return false
}

export const googlePlayBillingPendingMessage =
  'Google Play Billing is available in the Android app.'
