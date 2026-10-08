import type { SubscriptionBillingCycle, SubscriptionPlan } from '../lib/settingsTypes'
import { supabase } from '../lib/supabase'
import {
  getGooglePlayActivePurchases,
  GOOGLE_PLAY_PURCHASE_STATE_PURCHASED,
  type GooglePlayOwnedPurchase,
  isGooglePlayBillingRuntime,
  openGooglePlaySubscriptions,
  purchaseGooglePlaySubscription,
  toGooglePlayProductId,
} from './googlePlayBillingService'
import { getFunctionInvokeErrorMessage, PurchaseCancelledError, requireUserId, ServiceError } from './serviceHelpers'
import type { SubscriptionRow } from './types'

export type EffectiveSubscriptionPlan = SubscriptionPlan | 'trial' | 'inactive'

export type JobCreationEntitlement = {
  effective_plan: EffectiveSubscriptionPlan
  jobs_used: number
  job_limit: number | null
  can_create_job: boolean
}

export async function getSubscription(): Promise<SubscriptionRow | null> {
  const userId = await requireUserId()
  const { error: lifecycleError } = await supabase.rpc('refresh_current_subscription_lifecycle')
  if (lifecycleError) throw lifecycleError
  const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle<SubscriptionRow>()
  if (error) throw error

  if (await syncGooglePlayPurchases(data)) {
    const { data: synced, error: syncedError } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle<SubscriptionRow>()
    if (syncedError) throw syncedError
    return synced
  }

  return data
}

export async function selectSubscriptionPlan(
  planName: SubscriptionPlan,
  billingCycle: SubscriptionBillingCycle = 'monthly',
): Promise<SubscriptionRow> {
  if (planName !== 'free') {
    throw new ServiceError(PAID_PLANS_ANDROID_ONLY_MESSAGE)
  }

  void billingCycle
  const { data, error } = await supabase.rpc('start_free_trial_subscription').single<SubscriptionRow>()
  if (error) throw error
  return data
}

const PAID_PLANS_ANDROID_ONLY_MESSAGE = 'Paid plans are available through Google Play in the TailorDeck Android app.'

export async function startPaidPlanUpgrade(params: {
  planName: Exclude<SubscriptionPlan, 'free'>
  billingCycle: SubscriptionBillingCycle
}): Promise<{ subscription: SubscriptionRow }> {
  if (!isGooglePlayBillingRuntime()) throw new ServiceError(PAID_PLANS_ANDROID_ONLY_MESSAGE)
  return purchaseAndVerifyGooglePlaySubscription(params)
}

/** Opens Google Play's subscription screen, where paid plans are cancelled or restored. */
export async function openGooglePlaySubscriptionManagement(subscription: SubscriptionRow | null | undefined): Promise<void> {
  if (!isGooglePlayBillingRuntime()) throw new ServiceError('Manage your subscription in the Google Play Store on your Android device.')
  await openGooglePlaySubscriptions(subscription?.google_play_product_id ?? null)
}

/** Re-reads the linked Google Play subscription (e.g. after the user cancels or restores it in the Play Store). */
export async function refreshGooglePlaySubscription(subscription: SubscriptionRow | null | undefined): Promise<boolean> {
  if (!isGooglePlayBillingRuntime()) return false
  if (subscription?.billing_provider !== 'google_play') return false
  if (!subscription.google_play_purchase_token || !subscription.google_play_product_id) return false

  try {
    await verifyGooglePlayPurchase({
      productId: subscription.google_play_product_id,
      purchaseToken: subscription.google_play_purchase_token,
    })
    return true
  } catch (error) {
    console.error('Unable to refresh Google Play subscription:', error)
    return false
  }
}

/** Free-trial cancellation only; paid Google Play plans are cancelled in the Play Store. */
export async function setFreeTrialCancellation(cancelAtPeriodEnd: boolean): Promise<SubscriptionRow> {
  const { data, error } = await supabase
    .rpc('set_free_trial_cancellation', { cancel_at_period_end_value: cancelAtPeriodEnd })
    .single<SubscriptionRow>()
  if (error) throw error
  return data
}

const GOOGLE_PLAY_VERIFY_ATTEMPTS = 3
const GOOGLE_PLAY_SYNC_RETRY_MS = 60_000
const googlePlaySyncAttempts = new Map<string, number>()
let googlePlaySyncInFlight: Promise<boolean> | null = null

async function purchaseAndVerifyGooglePlaySubscription(params: {
  planName: Exclude<SubscriptionPlan, 'free'>
  billingCycle: SubscriptionBillingCycle
}): Promise<{ subscription: SubscriptionRow }> {
  const userId = await requireUserId()
  const { data: current, error: currentError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<SubscriptionRow>()
  if (currentError) throw currentError

  const replacesGooglePlayPlan =
    current?.billing_provider === 'google_play' &&
    Boolean(current.google_play_purchase_token) &&
    current.plan_name !== 'free'

  const purchase = await purchaseGooglePlaySubscription({
    planName: params.planName,
    billingCycle: params.billingCycle,
    oldPurchaseToken: replacesGooglePlayPlan ? current?.google_play_purchase_token : null,
    userId,
  })

  if (purchase.status === 'canceled') throw new PurchaseCancelledError()
  if (purchase.status === 'pending') {
    throw new ServiceError('Your Google Play payment is still processing. Your plan will update once Google confirms it.')
  }

  try {
    await verifyGooglePlayPurchaseWithRetry({
      productId: purchase.productId || toGooglePlayProductId(params.planName),
      basePlanId: purchase.basePlanId || params.billingCycle,
      purchaseToken: purchase.purchaseToken,
    })
  } catch (error) {
    // Google has already charged the user here, so the message must say the payment is safe and will be retried.
    console.error('Google Play purchase verification failed:', error)
    throw new ServiceError(
      'Google Play received your payment, but we could not confirm it yet. Reopen Subscription in a moment and we will finish activating your plan automatically.',
    )
  }

  const subscription = await getSubscription()
  if (!subscription) throw new ServiceError('Unable to load subscription after Google Play purchase.')
  return { subscription }
}

async function verifyGooglePlayPurchase(body: {
  productId: string
  basePlanId?: string
  purchaseToken: string
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke('google-play-verify-subscription', { body })

  if (error) {
    throw new ServiceError(
      await getFunctionInvokeErrorMessage(error, 'Unable to verify Google Play subscription.'),
    )
  }

  if (!data || data.ok !== true) {
    throw new ServiceError('Unable to verify Google Play subscription.')
  }
}

async function verifyGooglePlayPurchaseWithRetry(body: Parameters<typeof verifyGooglePlayPurchase>[0]): Promise<void> {
  let lastError: unknown
  for (let attempt = 1; attempt <= GOOGLE_PLAY_VERIFY_ATTEMPTS; attempt += 1) {
    try {
      await verifyGooglePlayPurchase(body)
      return
    } catch (error) {
      lastError = error
      if (attempt < GOOGLE_PLAY_VERIFY_ATTEMPTS) {
        await new Promise((resolve) => window.setTimeout(resolve, attempt * 1500))
      }
    }
  }
  throw lastError
}

/**
 * Re-verifies Google Play subscriptions the device owns but TailorDeck has not linked yet
 * (e.g. verification failed after payment, or the app closed mid-purchase). Google refunds
 * purchases that stay unacknowledged for 3 days, so this runs whenever the subscription loads.
 * It also re-checks the linked purchase once its period has ended, so Google renewals keep the plan.
 * Returns true when at least one purchase was newly linked or refreshed.
 */
function syncGooglePlayPurchases(subscription: SubscriptionRow | null): Promise<boolean> {
  if (!isGooglePlayBillingRuntime()) return Promise.resolve(false)
  if (googlePlaySyncInFlight) return googlePlaySyncInFlight

  googlePlaySyncInFlight = (async () => {
    let linked = false
    try {
      const purchases = await getGooglePlayActivePurchases()
      for (const purchase of purchases) {
        if (!shouldSyncGooglePlayPurchase(purchase, subscription)) continue

        const lastAttempt = googlePlaySyncAttempts.get(purchase.purchaseToken) ?? 0
        if (Date.now() - lastAttempt < GOOGLE_PLAY_SYNC_RETRY_MS) continue
        googlePlaySyncAttempts.set(purchase.purchaseToken, Date.now())

        try {
          await verifyGooglePlayPurchase({ productId: purchase.productId, purchaseToken: purchase.purchaseToken })
          linked = true
        } catch (error) {
          console.error('Unable to sync Google Play purchase:', error)
        }
      }
    } catch (error) {
      console.error('Unable to read Google Play purchases:', error)
    } finally {
      googlePlaySyncInFlight = null
    }
    return linked
  })()

  return googlePlaySyncInFlight
}

function shouldSyncGooglePlayPurchase(purchase: GooglePlayOwnedPurchase, subscription: SubscriptionRow | null): boolean {
  if (purchase.purchaseState !== GOOGLE_PLAY_PURCHASE_STATE_PURCHASED) return false

  const linkedToken = subscription?.google_play_purchase_token ?? null
  const planLapsed =
    !subscription ||
    subscription.plan_name === 'free' ||
    Boolean(subscription.current_period_ends_at && new Date(subscription.current_period_ends_at).getTime() <= Date.now())

  if (purchase.purchaseToken === linkedToken) return planLapsed
  // An acknowledged purchase that differs from the linked one was already handled (e.g. a replaced plan).
  return !purchase.isAcknowledged || !linkedToken || planLapsed
}

/**
 * Every feature key the user's current plan includes, in one call. Returns null when the database does not
 * have get_my_enabled_features yet (migration 20261008100000 not applied), so callers can fall back.
 */
export async function getEnabledFeatures(): Promise<string[] | null> {
  const { data, error } = await supabase.rpc('get_my_enabled_features')
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') return null
    throw error
  }
  return Array.isArray(data) ? (data as string[]) : []
}

export async function checkFeatureAccess(featureKey: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_feature_access', {
    feature_key_value: featureKey,
  })
  if (error) throw error
  return data === true
}

export async function getJobCreationEntitlement(): Promise<JobCreationEntitlement> {
  const { data, error } = await supabase.rpc('get_job_creation_entitlement').maybeSingle<JobCreationEntitlement>()
  if (error) throw error
  if (!data) {
    return {
      effective_plan: 'inactive',
      jobs_used: 0,
      job_limit: null,
      can_create_job: false,
    }
  }
  return data
}

export function getJobCreationBlockedMessage(entitlement?: Pick<JobCreationEntitlement, 'effective_plan' | 'job_limit'> | null): string {
  if (entitlement?.effective_plan === 'free') {
    const limitLabel = typeof entitlement.job_limit === 'number' ? entitlement.job_limit : 3
    return `You've reached your Free plan limit. Upgrade to Starter to continue creating more than ${limitLabel} jobs.`
  }

  return 'Your current plan cannot create jobs right now. View plans to continue.'
}

export function getTrialEnd(subscription: SubscriptionRow): string | null {
  const trialEnd = subscription.tester_trial_ends_at || subscription.trial_ends_at
  return trialEnd || null
}

function isFreeTrialActive(subscription: SubscriptionRow, now = Date.now()): boolean {
  if (subscription.plan_name !== 'free' || subscription.status !== 'active') return false
  const trialEnd = getTrialEnd(subscription)
  if (!trialEnd) return false
  return new Date(trialEnd).getTime() > now
}

export function getEffectiveSubscriptionPlan(subscription: SubscriptionRow, now = Date.now()): EffectiveSubscriptionPlan {
  if (isFreeTrialActive(subscription, now)) return 'trial'
  if (subscription.plan_name === 'free' && subscription.status === 'active') return 'free'
  if (subscription.plan_name !== 'free' && subscription.current_period_ends_at && new Date(subscription.current_period_ends_at).getTime() <= now) return 'free'
  if (subscription.status === 'cancelled' && subscription.current_period_ends_at && new Date(subscription.current_period_ends_at).getTime() > now) return subscription.plan_name
  if (subscription.status !== 'active') return 'inactive'
  return subscription.plan_name
}
