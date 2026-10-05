import { registerPlugin } from '@capacitor/core'
import { isNativeAndroidApp } from '../lib/billingPlatform'

export type GooglePlayProductId = 'tailordeck_starter' | 'tailordeck_pro'
export type GooglePlayBasePlanId = 'monthly' | 'yearly'
export type GooglePlayPlanName = 'starter' | 'pro'
export type GooglePlayBillingCycle = 'monthly' | 'yearly'

export type GooglePlayPurchaseResult =
  | {
      status: 'canceled'
      productId?: GooglePlayProductId
      basePlanId?: GooglePlayBasePlanId
    }
  | ({
      status: 'purchased' | 'pending'
      productId: GooglePlayProductId
      basePlanId: GooglePlayBasePlanId
    } & GooglePlayPurchaseDetails)

type GooglePlayPurchaseDetails = {
  purchaseToken: string
  orderId?: string
  packageName?: string
  purchaseState?: number
  isAcknowledged?: boolean
}

export type GooglePlayOwnedPurchase = GooglePlayPurchaseDetails & {
  productId: GooglePlayProductId
}

export type GooglePlayPrice = {
  productId: GooglePlayProductId
  basePlanId: GooglePlayBasePlanId
  formattedPrice: string
  priceAmountMicros: number
  currencyCode: string
}

// Mirrors com.android.billingclient.api.Purchase.PurchaseState.PURCHASED
export const GOOGLE_PLAY_PURCHASE_STATE_PURCHASED = 1

interface GooglePlayBillingStatus {
  available: boolean
  responseOkCode: number
}

interface TailorDeckBillingPlugin {
  getBillingStatus(): Promise<GooglePlayBillingStatus>
  purchaseSubscription(options: {
    productId: GooglePlayProductId
    basePlanId: GooglePlayBasePlanId
    oldPurchaseToken?: string
    obfuscatedAccountId?: string
  }): Promise<GooglePlayPurchaseResult>
  getActivePurchases(): Promise<{ purchases: GooglePlayOwnedPurchase[] }>
  openSubscriptionManagement(options: { productId?: string }): Promise<void>
  getSubscriptionPrices(): Promise<{ prices: GooglePlayPrice[] }>
}

const TailorDeckBilling = registerPlugin<TailorDeckBillingPlugin>('TailorDeckBilling')

export function isGooglePlayBillingRuntime(): boolean {
  return isNativeAndroidApp()
}

export function toGooglePlayProductId(planName: GooglePlayPlanName): GooglePlayProductId {
  return planName === 'starter' ? 'tailordeck_starter' : 'tailordeck_pro'
}

export async function getGooglePlayBillingStatus(): Promise<GooglePlayBillingStatus> {
  if (!isGooglePlayBillingRuntime()) return { available: false, responseOkCode: -1 }
  return TailorDeckBilling.getBillingStatus()
}

export async function purchaseGooglePlaySubscription(params: {
  planName: GooglePlayPlanName
  billingCycle: GooglePlayBillingCycle
  /** Token of the Google Play subscription being replaced, so a plan change does not bill twice. */
  oldPurchaseToken?: string | null
  /** TailorDeck user id; Google returns it with the purchase so the server can link it without the app. */
  userId: string
}): Promise<GooglePlayPurchaseResult> {
  if (!isGooglePlayBillingRuntime()) {
    throw new Error('Google Play Billing is only available in the Android app.')
  }

  return TailorDeckBilling.purchaseSubscription({
    productId: toGooglePlayProductId(params.planName),
    basePlanId: params.billingCycle,
    obfuscatedAccountId: params.userId,
    ...(params.oldPurchaseToken ? { oldPurchaseToken: params.oldPurchaseToken } : {}),
  })
}

export async function getGooglePlayActivePurchases(): Promise<GooglePlayOwnedPurchase[]> {
  if (!isGooglePlayBillingRuntime()) return []
  const { purchases } = await TailorDeckBilling.getActivePurchases()
  return purchases ?? []
}

export async function openGooglePlaySubscriptions(productId: string | null): Promise<void> {
  await TailorDeckBilling.openSubscriptionManagement(productId ? { productId } : {})
}

export async function getGooglePlaySubscriptionPrices(): Promise<GooglePlayPrice[]> {
  if (!isGooglePlayBillingRuntime()) return []
  const { prices } = await TailorDeckBilling.getSubscriptionPrices()
  return prices ?? []
}
