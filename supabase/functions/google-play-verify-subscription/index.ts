import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import {
  acknowledgeGoogleSubscription,
  type BillingCycle,
  createServiceClient,
  evaluateGoogleSubscription,
  getGoogleAccessToken,
  getGoogleSubscription,
  getPlayServiceAccount,
  getPurchaseUserId,
  getRequiredEnv,
  getSafeErrorMessage,
  isSupportedBasePlanId,
  isSupportedProductId,
  saveEntitledSubscription,
  type SupabaseServiceClient,
  type SupportedProductId,
  UpstreamGoogleError,
} from '../_shared/googlePlay.ts'

type VerifyRequest = {
  productId?: unknown
  purchaseToken?: unknown
  basePlanId?: unknown
}

class UserVisibleError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
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

    const packageName = getRequiredEnv('GOOGLE_PLAY_PACKAGE_NAME')
    const supabase = createServiceClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      throw new UserVisibleError('Authentication required.', 401)
    }

    const payload = parsePayload(await readRequestJson(request))
    const googleAccessToken = await getGoogleAccessToken(getPlayServiceAccount())
    const subscription = await getGoogleSubscription(packageName, payload.purchaseToken, googleAccessToken)

    const purchaseUserId = getPurchaseUserId(subscription)
    if (purchaseUserId && purchaseUserId !== user.id) {
      throw new UserVisibleError('This Google Play purchase belongs to another TailorDeck account.', 409)
    }

    const entitlement = evaluateGoogleSubscription(subscription, payload.productId)

    if (entitlement.kind === 'unsupported') throw new UserVisibleError(entitlement.reason, 422)
    if (entitlement.kind === 'pending') throw new UserVisibleError('Google Play payment is still pending.', 409)
    if (entitlement.kind === 'lapsed') {
      throw new UserVisibleError(`Google Play subscription is not active (${entitlement.subscriptionState}).`, 402)
    }

    if (payload.basePlanId && entitlement.basePlanId !== payload.basePlanId) {
      throw new UserVisibleError('Purchase does not match the requested billing period.', 422)
    }

    await assertPurchaseTokenIsAvailable(supabase, payload.purchaseToken, user.id)

    if (subscription.acknowledgementState !== 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED') {
      await acknowledgeGoogleSubscription({
        packageName,
        productId: entitlement.productId,
        purchaseToken: payload.purchaseToken,
        accessToken: googleAccessToken,
        userId: user.id,
      })
    }

    const subscriptionId = await saveEntitledSubscription(supabase, {
      userId: user.id,
      entitlement,
      purchaseToken: payload.purchaseToken,
      orderId: subscription.latestOrderId ?? null,
    })

    return jsonResponse(
      {
        ok: true,
        provider: 'google_play',
        subscriptionId,
        productId: entitlement.productId,
        planName: entitlement.planName,
        resolvedBasePlanId: entitlement.basePlanId,
        subscriptionState: entitlement.subscriptionState,
        cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
        expiryTime: entitlement.expiryTime,
      },
      200,
      request,
    )
  } catch (error) {
    if (error instanceof UserVisibleError) {
      console.warn(`Google Play verification rejected (${error.status}): ${error.message}`)
      return jsonResponse({ error: error.message }, error.status, request)
    }

    console.error('Google Play verification failed:', getSafeErrorMessage(error))
    const status = error instanceof UpstreamGoogleError ? 502 : 500
    return jsonResponse({ error: 'Unable to verify Google Play subscription right now.' }, status, request)
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

  const purchaseToken = typeof body.purchaseToken === 'string' ? body.purchaseToken.trim() : ''
  if (!purchaseToken) {
    throw new UserVisibleError('Missing Google Play purchase token.')
  }

  const basePlanId = typeof body.basePlanId === 'string' ? body.basePlanId.trim() : ''
  if (!basePlanId) return { productId, purchaseToken }
  if (!isSupportedBasePlanId(basePlanId)) {
    throw new UserVisibleError('Unsupported Google Play billing period.')
  }

  return { productId, purchaseToken, basePlanId }
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
    throw new UserVisibleError('This Google Play purchase is already linked to another TailorDeck account.', 409)
  }
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header?.toLowerCase().startsWith('bearer ')) return null
  return header.slice('bearer '.length).trim()
}
