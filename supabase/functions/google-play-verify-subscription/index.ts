import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { handleOptions, jsonResponse } from '../_shared/cors.ts'

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/androidpublisher'
const DEFAULT_GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

const ACTIVE_SUBSCRIPTION_STATES = new Set([
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
])

const SUPPORTED_BASE_PLAN_IDS = new Set(['monthly', 'yearly'])

const SUPPORTED_PRODUCTS = {
  tailordeck_starter: 'starter',
  tailordeck_pro: 'pro',
} as const

type SupportedProductId = keyof typeof SUPPORTED_PRODUCTS
type PlanName = (typeof SUPPORTED_PRODUCTS)[SupportedProductId]
type BillingCycle = 'monthly' | 'yearly'

type VerifyRequest = {
  productId?: unknown
  purchaseToken?: unknown
  basePlanId?: unknown
}

type SupabaseServiceClient = ReturnType<typeof createClient>

type ServiceAccountJson = {
  client_email?: string
  private_key?: string
  token_uri?: string
}

type VerifiedServiceAccount = {
  client_email: string
  private_key: string
  token_uri: string
}

type GoogleSubscriptionLineItem = {
  productId?: string
  expiryTime?: string
  offerDetails?: {
    basePlanId?: string
    offerId?: string
  }
}

type GoogleSubscriptionPurchase = {
  latestOrderId?: string
  acknowledgementState?: string
  subscriptionState?: string
  lineItems?: GoogleSubscriptionLineItem[]
}

type SaveGooglePlaySubscriptionInput = {
  userId: string
  productId: SupportedProductId
  planName: PlanName
  basePlanId: BillingCycle
  billingCycle: BillingCycle
  purchaseToken: string
  orderId: string | null
  subscriptionState: string
  expiryTime: string | null
  verifiedAt: string
}

class UserVisibleError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

class UpstreamGoogleError extends Error {
  constructor(public status: number) {
    super(`Google Play API returned ${status}`)
  }
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405, request)
  }

  try {
    const accessToken = getBearerToken(request)
    if (!accessToken) throw new UserVisibleError('Authentication required.', 401)

    const supabaseUrl = getRequiredEnv('SUPABASE_URL')
    const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    const packageName = getRequiredEnv('GOOGLE_PLAY_PACKAGE_NAME')
    const serviceAccount = parseServiceAccount(
      getRequiredEnv('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'),
    )

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      throw new UserVisibleError('Authentication required.', 401)
    }

    const payload = parsePayload(await readRequestJson(request))
    const googleAccessToken = await getGoogleAccessToken(serviceAccount)
    const subscription = await getGoogleSubscription(
      packageName,
      payload.purchaseToken,
      googleAccessToken,
    )

    const matchingLineItem = subscription.lineItems?.find(
      (item) => item.productId === payload.productId,
    )

    if (!matchingLineItem) {
      throw new UserVisibleError(
        'Purchase does not match the requested product.',
        422,
      )
    }

    const resolvedBasePlanId = matchingLineItem.offerDetails?.basePlanId ?? null
    if (payload.basePlanId && resolvedBasePlanId !== payload.basePlanId) {
      throw new UserVisibleError(
        'Purchase does not match the requested billing period.',
        422,
      )
    }

    const subscriptionState =
      subscription.subscriptionState ?? 'SUBSCRIPTION_STATE_UNSPECIFIED'
    const isActive = ACTIVE_SUBSCRIPTION_STATES.has(subscriptionState)

    if (!isActive) {
      throw new UserVisibleError('Google Play subscription is not active.', 402)
    }

    if (!isSupportedBasePlanId(resolvedBasePlanId)) {
      throw new UserVisibleError(
        'Unsupported Google Play billing period.',
        422,
      )
    }

    await assertPurchaseTokenIsAvailable(supabase, payload.purchaseToken, user.id)

    if (subscription.acknowledgementState !== 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED') {
      await acknowledgeGoogleSubscription(
        packageName,
        payload.productId,
        payload.purchaseToken,
        googleAccessToken,
        user.id,
      )
    }

    const verifiedAt = new Date().toISOString()
    const subscriptionId = await saveGooglePlaySubscription(supabase, {
      userId: user.id,
      productId: payload.productId,
      planName: SUPPORTED_PRODUCTS[payload.productId],
      basePlanId: resolvedBasePlanId,
      billingCycle: resolvedBasePlanId,
      purchaseToken: payload.purchaseToken,
      orderId: subscription.latestOrderId ?? null,
      subscriptionState,
      expiryTime: matchingLineItem.expiryTime ?? null,
      verifiedAt,
    })

    return jsonResponse(
      {
        ok: true,
        provider: 'google_play',
        subscriptionId,
        packageName,
        userId: user.id,
        productId: payload.productId,
        planName: SUPPORTED_PRODUCTS[payload.productId],
        requestedBasePlanId: payload.basePlanId ?? null,
        resolvedBasePlanId,
        subscriptionState,
        active: isActive,
        expiryTime: matchingLineItem.expiryTime ?? null,
        orderId: subscription.latestOrderId ?? null,
        verifiedAt,
      },
      200,
      request,
    )
  } catch (error) {
    if (error instanceof UserVisibleError) {
      return jsonResponse({ error: error.message }, error.status, request)
    }

    console.error('Google Play verification failed:', getSafeErrorMessage(error))
    const status = error instanceof UpstreamGoogleError ? 502 : 500
    return jsonResponse(
      { error: 'Unable to verify Google Play subscription right now.' },
      status,
      request,
    )
  }
})

async function readRequestJson(request: Request): Promise<VerifyRequest> {
  try {
    return (await request.json()) as VerifyRequest
  } catch {
    throw new UserVisibleError('Invalid JSON body.')
  }
}

function parsePayload(body: VerifyRequest): {
  productId: SupportedProductId
  purchaseToken: string
  basePlanId?: BillingCycle
} {
  const productId = typeof body.productId === 'string' ? body.productId.trim() : ''
  if (!isSupportedProductId(productId)) {
    throw new UserVisibleError('Unsupported Google Play product.')
  }

  const purchaseToken =
    typeof body.purchaseToken === 'string' ? body.purchaseToken.trim() : ''
  if (!purchaseToken) {
    throw new UserVisibleError('Missing Google Play purchase token.')
  }

  const basePlanId =
    typeof body.basePlanId === 'string' ? body.basePlanId.trim() : ''
  if (basePlanId && !isSupportedBasePlanId(basePlanId)) {
    throw new UserVisibleError('Unsupported Google Play billing period.')
  }

  return {
    productId,
    purchaseToken,
    ...(basePlanId ? { basePlanId } : {}),
  }
}

function isSupportedProductId(productId: string): productId is SupportedProductId {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_PRODUCTS, productId)
}

function isSupportedBasePlanId(basePlanId: string | null): basePlanId is BillingCycle {
  return Boolean(basePlanId && SUPPORTED_BASE_PLAN_IDS.has(basePlanId))
}

async function assertPurchaseTokenIsAvailable(
  supabase: SupabaseServiceClient,
  purchaseToken: string,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('google_play_purchase_token', purchaseToken)
    .maybeSingle()

  if (error) throw error

  const linkedUserId = (data as { user_id: string } | null)?.user_id
  if (linkedUserId && linkedUserId !== userId) {
    throw new UserVisibleError(
      'This Google Play purchase is already linked to another TailorDeck account.',
      409,
    )
  }
}

async function saveGooglePlaySubscription(
  supabase: SupabaseServiceClient,
  input: SaveGooglePlaySubscriptionInput,
): Promise<string> {
  const subscriptionPayload = {
    plan_name: input.planName,
    status: 'active',
    billing_cycle: input.billingCycle,
    payment_status: 'paid',
    cancel_at_period_end: false,
    billing_provider: 'google_play',
    current_period_end: input.expiryTime,
    current_period_ends_at: input.expiryTime,
    google_play_product_id: input.productId,
    google_play_base_plan_id: input.basePlanId,
    google_play_purchase_token: input.purchaseToken,
    google_play_order_id: input.orderId,
    google_play_subscription_state: input.subscriptionState,
    google_play_last_verified_at: input.verifiedAt,
  }

  const { data: existingSubscription, error: existingError } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', input.userId)
    .maybeSingle()

  if (existingError) throw existingError

  const existingSubscriptionId =
    (existingSubscription as { id: string } | null)?.id

  if (existingSubscriptionId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionPayload)
      .eq('id', existingSubscriptionId)
      .select('id')
      .single()

    if (error) throw error
    return (data as { id: string }).id
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({ ...subscriptionPayload, user_id: input.userId })
    .select('id')
    .single()

  if (error) throw error
  return (data as { id: string }).id
}

async function acknowledgeGoogleSubscription(
  packageName: string,
  productId: SupportedProductId,
  purchaseToken: string,
  accessToken: string,
  userId: string,
): Promise<void> {
  const response = await fetch(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
      packageName,
    )}/purchases/subscriptions/${encodeURIComponent(
      productId,
    )}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ developerPayload: `tailordeck:${userId}` }),
    },
  )

  if (!response.ok) throw new UpstreamGoogleError(response.status)
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header?.toLowerCase().startsWith('bearer ')) return null
  return header.slice('bearer '.length).trim()
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function parseServiceAccount(rawJson: string): VerifiedServiceAccount {
  let parsed: ServiceAccountJson
  try {
    parsed = JSON.parse(rawJson) as ServiceAccountJson
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

async function getGoogleAccessToken(
  serviceAccount: VerifiedServiceAccount,
): Promise<string> {
  const assertion = await createServiceAccountJwt(serviceAccount)
  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!response.ok) throw new UpstreamGoogleError(response.status)

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Google OAuth response missing access token.')
  }

  return data.access_token
}

async function createServiceAccountJwt(
  serviceAccount: VerifiedServiceAccount,
): Promise<string> {
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

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedJwt),
  )

  return `${unsignedJwt}.${base64UrlEncode(new Uint8Array(signature))}`
}

async function getGoogleSubscription(
  packageName: string,
  purchaseToken: string,
  accessToken: string,
): Promise<GoogleSubscriptionPurchase> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
    packageName,
  )}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`

  const response = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new UpstreamGoogleError(response.status)

  return (await response.json()) as GoogleSubscriptionPurchase
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
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : input

  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}
