import { Capacitor } from '@capacitor/core'

export function isNativeAndroidApp(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function isGooglePlayBillingPending(): boolean {
  return isNativeAndroidApp()
}

export const googlePlayBillingPendingMessage =
  'Google Play Billing is coming soon for Android. Your tester trial remains active while we finish paid upgrades.'
