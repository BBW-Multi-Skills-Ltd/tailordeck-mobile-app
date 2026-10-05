import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Shared Google Play Billing helpers for google-play-verify-subscription and google-play-rtdn.

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/androidpublisher'
const DEFAULT_GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const ANDROID_PUBLISHER_URL = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications'

export const SUPPORTED_PRODUCTS = {
  tailordeck_starter: 'starter',
  tailordeck_pro: 'pro',
} as const

const SUPPORTED_BASE_PLAN_IDS = new Set(['monthly', 'yearly'])

export type SupportedProductId = keyof typeof SUPPORTED_PRODUCTS
export type PlanName = (typeof SUPPORTED_PRODUCTS)[SupportedProductId]
export type BillingCycle = 'monthly' | 'yearly'
// No generated DB types for edge functions, so the schema is left untyped.
// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseServiceClient = SupabaseClient<any, 'public', any>

export type ServiceAccount = {
  client_email: string
  private_key: string
  token_uri: string
}

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

export function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function createServiceClient(): SupabaseServiceClient {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
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
    parsed = JSON.parse(getRequiredEnv('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')) as Partial<ServiceAccount>
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

let cachedAccessToken: { token: string; expiresAt: number } | null = null

export async function getGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.token

  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: await createServiceAccountJwt(serviceAccount),
    }),
  })

  if (!response.ok) throw await UpstreamGoogleError.fromResponse(response)

  const data = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('Google OAuth response missing access token.')

  cachedAccessToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 }
  return data.access_token
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
    current_period_end: entitlement.expiryTime,
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
      current_period_end: input.entitlement.expiryTime,
      google_play_subscription_state: input.entitlement.subscriptionState,
      google_play_last_verified_at: new Date().toISOString(),
    })
    .eq('id', input.subscriptionId)
    .neq('plan_name', 'free')
  if (error) throw error
}

async function createServiceAccountJwt(serviceAccount: ServiceAccount): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: GOOGLE_SCOPE,
      aud: serviceAccount.token_uri,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    }),
  )

  const unsignedJwt = `${header}.${claim}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsignedJwt))
  return `${unsignedJwt}.${base64UrlEncode(new Uint8Array(signature))}`
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '')

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Unknown error'
}
