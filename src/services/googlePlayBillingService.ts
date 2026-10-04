import { Capacitor, registerPlugin } from '@capacitor/core'

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
  | {
      status: 'purchased'
      productId: GooglePlayProductId
      basePlanId: GooglePlayBasePlanId
      purchaseToken: string
      orderId?: string
      packageName?: string
      purchaseState?: number
      isAcknowledged?: boolean
    }

interface GooglePlayBillingStatus {
  available: boolean
  responseOkCode: number
}

interface TailorDeckBillingPlugin {
  getBillingStatus(): Promise<GooglePlayBillingStatus>
  purchaseSubscription(options: {
    productId: GooglePlayProductId
    basePlanId: GooglePlayBasePlanId
  }): Promise<GooglePlayPurchaseResult>
}

const TailorDeckBilling = registerPlugin<TailorDeckBillingPlugin>('TailorDeckBilling')

export function isGooglePlayBillingRuntime(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
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
}): Promise<GooglePlayPurchaseResult> {
  if (!isGooglePlayBillingRuntime()) {
    throw new Error('Google Play Billing is only available in the Android app.')
  }

  return TailorDeckBilling.purchaseSubscription({
    productId: toGooglePlayProductId(params.planName),
    basePlanId: params.billingCycle,
  })
}
