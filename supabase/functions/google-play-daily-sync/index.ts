import {
  acknowledgeGoogleSubscription,
  cancelLinkedSubscriptionForUser,
  createServiceClient,
  evaluateGoogleSubscription,
  getGoogleAccessToken,
  getGoogleSubscription,
  getPlayServiceAccount,
  getRequiredEnv,
  getSafeErrorMessage,
  markSubscriptionLapsed,
  saveEntitledSubscription,
  UpstreamGoogleError,
} from '../_shared/googlePlay.ts'
import { timingSafeEqual } from '../_shared/secrets.ts'

// Daily safety net for Google Play subscriptions (scheduled by pg_cron, see the
// google_play_daily_sync migration). Re-reads every linked purchase from Google so renewals,
// cancellations, failed payments, expiries and refunds reach TailorDeck even when the user
// never opens the app. Without Pub/Sub notifications this is the only server-side sync.

const PAGE_SIZE = 200
// Google stops returning a purchase about 60 days after it ends; older free rows are not re-checked.
const LAPSED_RECHECK_DAYS = 60

type LinkedSubscription = {
  id: string
  user_id: string
  plan_name: string
  google_play_purchase_token: string
}

type SyncCounts = {
  checked: number
  active: number
  lapsed: number
  skipped: number
  failed: number
  renewalCancelledForDeletion: number
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const syncSecret = Deno.env.get('GOOGLE_PLAY_SYNC_SECRET')
  if (!syncSecret) return json({ error: 'Daily sync is not enabled. Missing GOOGLE_PLAY_SYNC_SECRET.' }, 503)
  if (!timingSafeEqual(request.headers.get('x-sync-secret') ?? '', syncSecret)) {
    return json({ error: 'Unauthorized sync request.' }, 401)
  }

  const counts: SyncCounts = { checked: 0, active: 0, lapsed: 0, skipped: 0, failed: 0, renewalCancelledForDeletion: 0 }

  try {
    const supabase = createServiceClient()
    const packageName = getRequiredEnv('GOOGLE_PLAY_PACKAGE_NAME')
    const accessToken = await getGoogleAccessToken(getPlayServiceAccount())
    const recheckSince = new Date(Date.now() - LAPSED_RECHECK_DAYS * 24 * 60 * 60 * 1000).toISOString()

    // Backup for google-play-cancel-for-deletion: accounts waiting to be deleted must not renew.
    const { data: pendingDeletion, error: pendingError } = await supabase
      .from('profiles')
      .select('user_id')
      .not('deletion_scheduled_at', 'is', null)
    if (pendingError) throw pendingError
    for (const { user_id: userId } of (pendingDeletion ?? []) as Array<{ user_id: string }>) {
      try {
        if ((await cancelLinkedSubscriptionForUser(supabase, userId)).cancelled) counts.renewalCancelledForDeletion += 1
      } catch (error) {
        counts.failed += 1
        console.error(`Daily sync could not cancel renewal for user ${userId}:`, getSafeErrorMessage(error))
      }
    }

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_name, google_play_purchase_token')
        .eq('billing_provider', 'google_play')
        .not('google_play_purchase_token', 'is', null)
        .or(`plan_name.neq.free,google_play_last_verified_at.gte.${recheckSince}`)
        .order('id')
        .range(from, from + PAGE_SIZE - 1)
      if (error) throw error

      const rows = (data ?? []) as LinkedSubscription[]
      for (const row of rows) {
        counts.checked += 1
        try {
          const outcome = await syncRow(supabase, packageName, accessToken, row)
          counts[outcome] += 1
        } catch (error) {
          counts.failed += 1
          console.error(`Daily sync failed for subscription ${row.id}:`, getSafeErrorMessage(error))
        }
      }

      if (rows.length < PAGE_SIZE) break
    }

    // Move anything that lapsed (today or earlier) to Free now instead of on the user's next visit.
    const { data: downgraded, error: downgradeError } = await supabase.rpc('process_due_subscription_downgrades', {
      batch_limit: 5000,
    })
    if (downgradeError) throw downgradeError

    const summary = { ok: true, ...counts, downgradedToFree: downgraded ?? 0 }
    console.log('Google Play daily sync finished:', JSON.stringify(summary))
    return json(summary, 200)
  } catch (error) {
    console.error('Google Play daily sync aborted:', getSafeErrorMessage(error), JSON.stringify(counts))
    return json({ ok: false, error: 'Daily sync failed.', ...counts }, 500)
  }
})

async function syncRow(
  supabase: ReturnType<typeof createServiceClient>,
  packageName: string,
  accessToken: string,
  row: LinkedSubscription,
): Promise<'active' | 'lapsed' | 'skipped'> {
  const purchaseToken = row.google_play_purchase_token
  let subscription
  try {
    subscription = await getGoogleSubscription(packageName, purchaseToken, accessToken)
  } catch (error) {
    // 410 Gone: Google no longer knows this purchase (ended long ago).
    if (error instanceof UpstreamGoogleError && error.status === 410) {
      if (row.plan_name === 'free') return 'skipped'
      await markSubscriptionLapsed(supabase, {
        subscriptionId: row.id,
        entitlement: { kind: 'lapsed', status: 'expired', expiryTime: null, subscriptionState: 'GONE' },
      })
      return 'lapsed'
    }
    throw error
  }

  const entitlement = evaluateGoogleSubscription(subscription)

  if (entitlement.kind === 'lapsed') {
    if (row.plan_name === 'free') return 'skipped'
    await markSubscriptionLapsed(supabase, { subscriptionId: row.id, entitlement })
    return 'lapsed'
  }

  if (entitlement.kind !== 'entitled') return 'skipped'

  if (subscription.acknowledgementState !== 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED') {
    await acknowledgeGoogleSubscription({
      packageName,
      productId: entitlement.productId,
      purchaseToken,
      accessToken,
      userId: row.user_id,
    })
  }

  await saveEntitledSubscription(supabase, {
    userId: row.user_id,
    entitlement,
    purchaseToken,
    orderId: subscription.latestOrderId ?? null,
  })
  return 'active'
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
