import { requiredEnv } from './env.ts'
import { DEFAULT_GOOGLE_TOKEN_URL, getServiceAccountAccessToken, GoogleTokenError, type ServiceAccount } from './googleAuth.ts'
import { createServiceClient, type ServiceClient } from './supabase.ts'

// Shared Google Play Billing helpers for the google-play-* functions and account deletion.

export { createServiceClient, requiredEnv as getRequiredEnv }
export type { ServiceAccount }
export type SupabaseServiceClient = ServiceClient

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/androidpublisher'
const ANDROID_PUBLISHER_URL = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications'

export const SUPPORTED_PRODUCTS = {
  tailordeck_starter: 'starter',
  tailordeck_pro: 'pro',
} as const

const SUPPORTED_BASE_PLAN_IDS = new Set(['monthly', 'yearly'])

export type SupportedProductId = keyof typeof SUPPORTED_PRODUCTS
export type PlanName = (typeof SUPPORTED_PRODUCTS)[SupportedProductId]
export type BillingCycle = 'monthly' | 'yearly'

export type GoogleSubscriptionLineItem = {
  productId?: string
  expiryTime?: string
  autoRenewingPlan?: { autoRenewEnabled?: boolean }
  offerDetails?: {
    basePlanId?: string
    offerId?: string
  }
}

export type GoogleSubscriptionPurchase = {
  latestOrderId?: string
  linkedPurchaseToken?: string
  acknowledgementState?: string
  subscriptionState?: string
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string }
  lineItems?: GoogleSubscriptionLineItem[]
}

/** What TailorDeck should do with a Google Play subscription, derived from Google's current state. */
export type GooglePlayEntitlement =
  | {
      kind: 'entitled'
      productId: SupportedProductId
      planName: PlanName
      basePlanId: BillingCycle
      expiryTime: string | null
      cancelAtPeriodEnd: boolean
      subscriptionState: string
    }
  | { kind: 'pending'; subscriptionState: string }
  | { kind: 'lapsed'; status: 'expired' | 'past_due'; expiryTime: string | null; subscriptionState: string }
  | { kind: 'unsupported'; subscriptionState: string; reason: string }

export class UpstreamGoogleError extends Error {
  constructor(public status: number, detail = '') {
    super(`Google Play API returned ${status}${detail ? `: ${detail}` : ''}`)
  }

  // Keeps Google's reason (e.g. permission denied, API disabled) in the function logs; never sent to clients.
  static async fromResponse(response: Response): Promise<UpstreamGoogleError> {
    const body = await response.text().catch(() => '')
    return new UpstreamGoogleError(response.status, body.replace(/\s+/g, ' ').slice(0, 500))
  }
}

export function isSupportedProductId(productId: string): productId is SupportedProductId {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_PRODUCTS, productId)
}

export function isSupportedBasePlanId(basePlanId: string | null | undefined): basePlanId is BillingCycle {
  return Boolean(basePlanId && SUPPORTED_BASE_PLAN_IDS.has(basePlanId))
}

export function getPlayServiceAccount(): ServiceAccount {
  let parsed: Partial<ServiceAccount>
  try {
    parsed = JSON.parse(requiredEnv('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')) as Partial<ServiceAccount>
  } catch {
    throw new Error('Invalid Google service account JSON.')
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Google service account JSON is missing required fields.')
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    token_uri: parsed.token_uri || DEFAULT_GOOGLE_TOKEN_URL,
  }
}

export async function getGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  try {
    return await getServiceAccountAccessToken(serviceAccount, GOOGLE_SCOPE)
  } catch (error) {
    // Keep reporting Google sign-in failures as upstream errors (502), as before.
    if (error instanceof GoogleTokenError) throw new UpstreamGoogleError(error.status, error.message)
    throw error
  }
}

export async function getGoogleSubscription(
  packageName: string,
  purchaseToken: string,
  accessToken: string,
): Promise<GoogleSubscriptionPurchase> {
  const response = await fetch(
    `${ANDROID_PUBLISHER_URL}/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  )

  if (!response.ok) throw await UpstreamGoogleError.fromResponse(response)
  return (await response.json()) as GoogleSubscriptionPurchase
}

export async function acknowledgeGoogleSubscription(params: {
  packageName: string
  productId: SupportedProductId
  purchaseToken: string
  accessToken: string
  userId: string
}): Promise<void> {
  const response = await fetch(
    `${ANDROID_PUBLISHER_URL}/${encodeURIComponent(params.packageName)}/purchases/subscriptions/${encodeURIComponent(
      params.productId,
    )}/tokens/${encodeURIComponent(params.purchaseToken)}:acknowledge`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${params.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ developerPayload: `tailordeck:${params.userId}` }),
    },
  )

  if (!response.ok) throw await UpstreamGoogleError.fromResponse(response)
}

/**
 * Stops auto-renewal (same as the user cancelling in the Play Store; no refund, access runs to expiry).
 * Already-cancelled or ended subscriptions count as success. Returns true when a cancel request was sent.
 */
export async function cancelGoogleSubscriptionRenewal(params: {
  packageName: string
  purchaseToken: string
  accessToken: string
}): Promise<boolean> {
  const current = await getGoogleSubscription(params.packageName, params.purchaseToken, params.accessToken).catch((error) => {
    if (error instanceof UpstreamGoogleError && error.status === 410) return null
    throw error
  })
  if (!current || !isAutoRenewing(current)) return false

  const productId = current.lineItems?.find((item) => isSupportedProductId(item.productId ?? ''))?.productId
  if (!productId) return false

  const response = await fetch(
    `${ANDROID_PUBLISHER_URL}/${encodeURIComponent(params.packageName)}/purchases/subscriptions/${encodeURIComponent(
      productId,
    )}/tokens/${encodeURIComponent(params.purchaseToken)}:cancel`,
    { method: 'POST', headers: { authorization: `Bearer ${params.accessToken}` } },
  )

  if (!response.ok) {
    // Google can reject a cancel for a subscription that has just stopped renewing; only fail if it still renews.
    const error = await UpstreamGoogleError.fromResponse(response)
    const after = await getGoogleSubscription(params.packageName, params.purchaseToken, params.accessToken).catch(() => null)
    if (after && isAutoRenewing(after)) throw error
  }
  return true
}

function isAutoRenewing(subscription: GoogleSubscriptionPurchase): boolean {
  const state = subscription.subscriptionState
  if (state !== 'SUBSCRIPTION_STATE_ACTIVE' && state !== 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD' && state !== 'SUBSCRIPTION_STATE_ON_HOLD') {
    return false
  }
  return subscription.lineItems?.some((item) => item.autoRenewingPlan?.autoRenewEnabled !== false) ?? false
}

/** The TailorDeck user id the app attached to the purchase (BillingFlowParams.setObfuscatedAccountId). */
export function getPurchaseUserId(subscription: GoogleSubscriptionPurchase): string | null {
  return subscription.externalAccountIdentifiers?.obfuscatedExternalAccountId ?? null
}

export function evaluateGoogleSubscription(
  subscription: GoogleSubscriptionPurchase,
  expectedProductId?: SupportedProductId,
): GooglePlayEntitlement {
  const subscriptionState = subscription.subscriptionState ?? 'SUBSCRIPTION_STATE_UNSPECIFIED'
  const lineItem = subscription.lineItems?.find((item) =>
    expectedProductId ? item.productId === expectedProductId : isSupportedProductId(item.productId ?? ''),
  )

  if (!lineItem || !isSupportedProductId(lineItem.productId ?? '')) {
    return { kind: 'unsupported', subscriptionState, reason: 'Purchase does not match a TailorDeck product.' }
  }

  const productId = lineItem.productId as SupportedProductId
  const basePlanId = lineItem.offerDetails?.basePlanId ?? null
  const expiryTime = lineItem.expiryTime ?? null
  const paidUntilLater = Boolean(expiryTime && new Date(expiryTime).getTime() > Date.now())

  switch (subscriptionState) {
    case 'SUBSCRIPTION_STATE_PENDING':
    case 'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED':
      return { kind: 'pending', subscriptionState }
    case 'SUBSCRIPTION_STATE_ON_HOLD':
    case 'SUBSCRIPTION_STATE_PAUSED':
      return { kind: 'lapsed', status: 'past_due', expiryTime, subscriptionState }
    case 'SUBSCRIPTION_STATE_ACTIVE':
    case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
    case 'SUBSCRIPTION_STATE_CANCELED':
      // A subscription cancelled in the Play Store stays paid up until its expiry time.
      if (subscriptionState === 'SUBSCRIPTION_STATE_CANCELED' && !paidUntilLater) {
        return { kind: 'lapsed', status: 'expired', expiryTime, subscriptionState }
      }
      if (!isSupportedBasePlanId(basePlanId)) {
        return { kind: 'unsupported', subscriptionState, reason: 'Unsupported Google Play billing period.' }
      }
      return {
        kind: 'entitled',
        productId,
        planName: SUPPORTED_PRODUCTS[productId],
        basePlanId,
        expiryTime,
        cancelAtPeriodEnd:
          subscriptionState === 'SUBSCRIPTION_STATE_CANCELED' || lineItem.autoRenewingPlan?.autoRenewEnabled === false,
        subscriptionState,
      }
    default:
      return { kind: 'lapsed', status: 'expired', expiryTime, subscriptionState }
  }
}

/**
 * Cancels renewal for a user's linked Google Play subscription (used when their account is being deleted)
 * and marks the row as ending. `linked` is false when the user has no Google Play subscription;
 * `cancelled` is true only when renewal was actually stopped by this call.
 */
export async function cancelLinkedSubscriptionForUser(
  supabase: SupabaseServiceClient,
  userId: string,
): Promise<{ linked: boolean; cancelled: boolean }> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, google_play_purchase_token')
    .eq('user_id', userId)
    .eq('billing_provider', 'google_play')
    .not('google_play_purchase_token', 'is', null)
    .maybeSingle()
  if (error) throw error
  const row = data as { id: string; google_play_purchase_token: string } | null
  if (!row) return { linked: false, cancelled: false }

  const cancelled = await cancelGoogleSubscriptionRenewal({
    packageName: requiredEnv('GOOGLE_PLAY_PACKAGE_NAME'),
    purchaseToken: row.google_play_purchase_token,
    accessToken: await getGoogleAccessToken(getPlayServiceAccount()),
  })

  if (cancelled) {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true, google_play_last_verified_at: new Date().toISOString() })
      .eq('id', row.id)
      .neq('plan_name', 'free')
    if (updateError) throw updateError
  }
  return { linked: true, cancelled }
}

/** Upserts the user's single subscription row with an active Google Play plan. */
export async function saveEntitledSubscription(
  supabase: SupabaseServiceClient,
  input: {
    userId: string
    entitlement: Extract<GooglePlayEntitlement, { kind: 'entitled' }>
    purchaseToken: string
    orderId: string | null
  },
): Promise<string> {
  const { entitlement } = input
  const subscriptionPayload = {
    plan_name: entitlement.planName,
    status: 'active',
    billing_cycle: entitlement.basePlanId,
    payment_status: 'paid',
    cancel_at_period_end: entitlement.cancelAtPeriodEnd,
    billing_provider: 'google_play',
    current_period_ends_at: entitlement.expiryTime,
    google_play_product_id: entitlement.productId,
    google_play_base_plan_id: entitlement.basePlanId,
    google_play_purchase_token: input.purchaseToken,
    google_play_order_id: input.orderId,
    google_play_subscription_state: entitlement.subscriptionState,
    google_play_last_verified_at: new Date().toISOString(),
  }

  const { data: existing, error: existingError } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', input.userId)
    .maybeSingle()
  if (existingError) throw existingError

  const existingId = (existing as { id: string } | null)?.id
  const query = existingId
    ? supabase.from('subscriptions').update(subscriptionPayload).eq('id', existingId)
    : supabase.from('subscriptions').insert({ ...subscriptionPayload, user_id: input.userId })

  const { data, error } = await query.select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}

/**
 * Marks a lapsed Google Play plan as expired/past_due. The existing subscription lifecycle
 * (refresh_current_subscription_lifecycle / process_due_subscription_downgrades) then moves it to Free,
 * keeping the purchase token so a recovered subscription can be re-linked.
 */
export async function markSubscriptionLapsed(
  supabase: SupabaseServiceClient,
  input: {
    subscriptionId: string
    entitlement: Extract<GooglePlayEntitlement, { kind: 'lapsed' }>
  },
): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: input.entitlement.status,
      payment_status: input.entitlement.status === 'past_due' ? 'failed' : 'none',
      google_play_subscription_state: input.entitlement.subscriptionState,
      google_play_last_verified_at: new Date().toISOString(),
    })
    .eq('id', input.subscriptionId)
    .neq('plan_name', 'free')
  if (error) throw error
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Unknown error'
}
