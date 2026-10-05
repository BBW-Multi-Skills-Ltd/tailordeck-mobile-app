import { createRemoteJWKSet, jwtVerify } from 'https://esm.sh/jose@5.9.6'
import {
  acknowledgeGoogleSubscription,
  createServiceClient,
  evaluateGoogleSubscription,
  getGoogleAccessToken,
  getGoogleSubscription,
  getPlayServiceAccount,
  getPurchaseUserId,
  getRequiredEnv,
  getSafeErrorMessage,
  markSubscriptionLapsed,
  saveEntitledSubscription,
  type SupabaseServiceClient,
} from '../_shared/googlePlay.ts'

// Google Play Real-time Developer Notifications, delivered by a Pub/Sub push subscription.
// Every notification is treated as "something changed": the current state is re-read from Google,
// so duplicate or out-of-order deliveries are harmless.
// Responses: 2xx acknowledges the message; 5xx makes Pub/Sub retry (used for transient failures only).

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
const SUBSCRIPTION_PRODUCT_TYPE = 1

type PubSubPushBody = {
  message?: { data?: string; messageId?: string }
}

type DeveloperNotification = {
  packageName?: string
  testNotification?: { version?: string }
  subscriptionNotification?: { notificationType?: number; purchaseToken?: string }
  voidedPurchaseNotification?: { purchaseToken?: string; productType?: number; refundType?: number }
}

type SubscriptionRowRef = { id: string; user_id: string; google_play_purchase_token: string | null }

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  if (!(await isAuthorizedPubSubPush(request))) {
    return new Response('Unauthorized', { status: 401 })
  }

  let messageId = 'unknown'
  try {
    const body = (await request.json()) as PubSubPushBody
    messageId = body.message?.messageId ?? messageId
    const notification = decodeNotification(body)
    if (!notification) {
      console.warn(`RTDN ${messageId}: unreadable message, acknowledging.`)
      return ok()
    }

    const packageName = getRequiredEnv('GOOGLE_PLAY_PACKAGE_NAME')
    if (notification.packageName !== packageName) {
      console.warn(`RTDN ${messageId}: ignoring notification for package ${notification.packageName}.`)
      return ok()
    }

    if (notification.testNotification) {
      console.log(`RTDN ${messageId}: test notification received.`)
      return ok()
    }

    const supabase = createServiceClient()

    if (notification.voidedPurchaseNotification) {
      await handleVoidedPurchase(supabase, messageId, notification.voidedPurchaseNotification)
      return ok()
    }

    const purchaseToken = notification.subscriptionNotification?.purchaseToken
    if (purchaseToken) {
      await syncSubscription(supabase, {
        messageId,
        packageName,
        purchaseToken,
        notificationType: notification.subscriptionNotification?.notificationType ?? 0,
      })
    }

    return ok()
  } catch (error) {
    console.error(`RTDN ${messageId} failed, Pub/Sub will retry:`, getSafeErrorMessage(error))
    return new Response('Retry later', { status: 500 })
  }
})

async function syncSubscription(
  supabase: SupabaseServiceClient,
  params: { messageId: string; packageName: string; purchaseToken: string; notificationType: number },
): Promise<void> {
  const { messageId, packageName, purchaseToken, notificationType } = params
  const accessToken = await getGoogleAccessToken(getPlayServiceAccount())
  const subscription = await getGoogleSubscription(packageName, purchaseToken, accessToken)
  const entitlement = evaluateGoogleSubscription(subscription)
  const label = `RTDN ${messageId} (type ${notificationType}, ${entitlement.subscriptionState})`

  if (entitlement.kind === 'pending' || entitlement.kind === 'unsupported') {
    console.log(`${label}: nothing to change (${entitlement.kind}).`)
    return
  }

  const row = await resolveSubscriptionRow(supabase, purchaseToken, subscription.linkedPurchaseToken ?? null, getPurchaseUserId(subscription))

  if (entitlement.kind === 'lapsed') {
    // Only lapse the plan if this token is the one currently linked; an old replaced token must not downgrade a newer plan.
    if (row?.google_play_purchase_token === purchaseToken) {
      await markSubscriptionLapsed(supabase, { subscriptionId: row.id, entitlement })
      console.log(`${label}: marked ${entitlement.status} for user ${row.user_id}.`)
    } else {
      console.log(`${label}: lapsed token is not the linked one, ignoring.`)
    }
    return
  }

  const userId = row?.user_id ?? getPurchaseUserId(subscription)
  if (!userId) {
    console.warn(`${label}: no TailorDeck account for this purchase yet; the app links it on next open.`)
    return
  }

  if (row && row.google_play_purchase_token && row.google_play_purchase_token !== purchaseToken
    && row.google_play_purchase_token !== subscription.linkedPurchaseToken) {
    // The account is linked to a different purchase. Keep it if that purchase is still paid up.
    const linked = await getGoogleSubscription(packageName, row.google_play_purchase_token, accessToken)
    if (evaluateGoogleSubscription(linked).kind === 'entitled') {
      console.warn(`${label}: user ${userId} already has another active Google Play subscription, ignoring.`)
      return
    }
  }

  if (subscription.acknowledgementState !== 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED') {
    await acknowledgeGoogleSubscription({
      packageName,
      productId: entitlement.productId,
      purchaseToken,
      accessToken,
      userId,
    })
  }

  await saveEntitledSubscription(supabase, {
    userId,
    entitlement,
    purchaseToken,
    orderId: subscription.latestOrderId ?? null,
  })
  console.log(`${label}: ${entitlement.planName} ${entitlement.basePlanId} active for user ${userId} until ${entitlement.expiryTime}.`)
}

async function handleVoidedPurchase(
  supabase: SupabaseServiceClient,
  messageId: string,
  voided: NonNullable<DeveloperNotification['voidedPurchaseNotification']>,
): Promise<void> {
  if (voided.productType !== SUBSCRIPTION_PRODUCT_TYPE || !voided.purchaseToken) return

  const row = await findRowByToken(supabase, voided.purchaseToken)
  if (!row) {
    console.log(`RTDN ${messageId}: voided purchase is not linked to an account.`)
    return
  }

  // Refunded or charged back: remove access now rather than at the end of the period.
  await markSubscriptionLapsed(supabase, {
    subscriptionId: row.id,
    entitlement: {
      kind: 'lapsed',
      status: 'expired',
      expiryTime: new Date().toISOString(),
      subscriptionState: 'VOIDED',
    },
  })
  console.log(`RTDN ${messageId}: voided purchase revoked for user ${row.user_id}.`)
}

async function resolveSubscriptionRow(
  supabase: SupabaseServiceClient,
  purchaseToken: string,
  linkedPurchaseToken: string | null,
  purchaseUserId: string | null,
): Promise<SubscriptionRowRef | null> {
  const byToken = await findRowByToken(supabase, purchaseToken)
  if (byToken) return byToken

  // Upgrades/downgrades issue a new token that points at the replaced one.
  if (linkedPurchaseToken) {
    const byLinkedToken = await findRowByToken(supabase, linkedPurchaseToken)
    if (byLinkedToken) return byLinkedToken
  }

  if (!purchaseUserId) return null
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, google_play_purchase_token')
    .eq('user_id', purchaseUserId)
    .maybeSingle()
  if (error) throw error
  return data as SubscriptionRowRef | null
}

async function findRowByToken(supabase: SupabaseServiceClient, purchaseToken: string): Promise<SubscriptionRowRef | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, google_play_purchase_token')
    .eq('google_play_purchase_token', purchaseToken)
    .maybeSingle()
  if (error) throw error
  return data as SubscriptionRowRef | null
}

/** Verifies the OIDC token Pub/Sub attaches to authenticated push requests. */
async function isAuthorizedPubSubPush(request: Request): Promise<boolean> {
  const header = request.headers.get('authorization') ?? ''
  if (!header.toLowerCase().startsWith('bearer ')) return false

  try {
    const audience =
      Deno.env.get('GOOGLE_RTDN_AUDIENCE') ?? `${getRequiredEnv('SUPABASE_URL')}/functions/v1/google-play-rtdn`
    const expectedEmail = Deno.env.get('GOOGLE_RTDN_PUSH_SERVICE_ACCOUNT') ?? getPlayServiceAccount().client_email

    const { payload } = await jwtVerify(header.slice('bearer '.length).trim(), GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience,
    })
    if (payload.email !== expectedEmail || payload.email_verified !== true) {
      console.warn(`RTDN push rejected: unexpected service account ${String(payload.email)}.`)
      return false
    }
    return true
  } catch (error) {
    const name = error instanceof Error ? error.name : 'Error'
    console.warn(`RTDN push rejected (${name}): ${getSafeErrorMessage(error)}`)
    return false
  }
}

function decodeNotification(body: PubSubPushBody): DeveloperNotification | null {
  const data = body.message?.data
  if (!data) return null
  try {
    const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as DeveloperNotification
  } catch {
    return null
  }
}

function ok(): Response {
  return new Response(null, { status: 204 })
}
