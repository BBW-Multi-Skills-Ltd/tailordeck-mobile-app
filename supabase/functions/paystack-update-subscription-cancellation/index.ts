import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient, createUserClient, findPaystackSubscriptionForCustomerPlan, getRequiredEnv } from '../_shared/paystack.ts'
import { enforceRateLimit, isRateLimitError } from '../_shared/rateLimit.ts'

type CancellationBody = {
  cancelAtPeriodEnd?: boolean
}

type SubscriptionRow = {
  id: string
  user_id: string
  plan_name: string
  status: string
  billing_cycle: string
  cancel_at_period_end: boolean
  current_period_ends_at: string | null
  paystack_customer_code: string | null
  paystack_plan_code: string | null
  paystack_subscription_code: string | null
  paystack_email_token: string | null
}

type PaystackSubscriptionResponse = {
  status: boolean
  message: string
  data?: {
    subscription_code?: string
    email_token?: string
    status?: string
  }
}

async function fetchPaystackEmailToken(subscriptionCode: string): Promise<string> {
  const response = await fetch(`https://api.paystack.co/subscription/${encodeURIComponent(subscriptionCode)}`, {
    headers: { Authorization: `Bearer ${getRequiredEnv('PAYSTACK_SECRET_KEY')}` },
  })
  const body = (await response.json()) as PaystackSubscriptionResponse
  if (!response.ok || !body.status || !body.data?.email_token) {
    throw new Error(body.message || 'Unable to fetch Paystack subscription token.')
  }
  return body.data.email_token
}

async function updatePaystackSubscription(params: { cancelAtPeriodEnd: boolean; code: string; token: string }): Promise<void> {
  const endpoint = params.cancelAtPeriodEnd ? 'disable' : 'enable'
  const response = await fetch(`https://api.paystack.co/subscription/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getRequiredEnv('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: params.code, token: params.token }),
  })

  const body = (await response.json()) as PaystackSubscriptionResponse
  if (!response.ok || !body.status) {
    throw new Error(body.message || `Unable to ${endpoint} Paystack subscription.`)
  }
}

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Missing Authorization header' }, 401, request)

    const body = (await request.json()) as CancellationBody
    if (typeof body.cancelAtPeriodEnd !== 'boolean') {
      return jsonResponse({ error: 'Cancellation state is required.' }, 400, request)
    }

    const userClient = createUserClient(authHeader)
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const admin = createAdminClient()
    await enforceRateLimit({
      action: 'paystack_update_subscription_cancellation',
      actorId: userData.user.id,
      admin,
      limit: 10,
      windowSeconds: 600,
    })

    const { data: subscription, error: subscriptionError } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle<SubscriptionRow>()

    if (subscriptionError) throw subscriptionError
    if (!subscription) return jsonResponse({ error: 'Subscription not found.' }, 404, request)

    let paystackEmailToken = subscription.paystack_email_token
    let paystackSubscriptionCode = subscription.paystack_subscription_code

    if (subscription.plan_name !== 'free' && (!paystackSubscriptionCode || !paystackEmailToken)) {
      const paystackSubscription = await findPaystackSubscriptionForCustomerPlan({
        customerCode: subscription.paystack_customer_code,
        planCode: subscription.paystack_plan_code,
      })
      paystackSubscriptionCode = paystackSubscriptionCode || paystackSubscription?.subscription_code || null
      paystackEmailToken = paystackEmailToken || paystackSubscription?.email_token || null
    }

    if (subscription.plan_name !== 'free' && !paystackSubscriptionCode) {
      return jsonResponse({ error: 'Paystack subscription was not found for this plan.' }, 409, request)
    }

    if (subscription.plan_name !== 'free' && paystackSubscriptionCode) {
      paystackEmailToken = paystackEmailToken || await fetchPaystackEmailToken(paystackSubscriptionCode)
      await updatePaystackSubscription({
        cancelAtPeriodEnd: body.cancelAtPeriodEnd,
        code: paystackSubscriptionCode,
        token: paystackEmailToken,
      })
    }

    const { data: updatedSubscription, error: updateError } = await admin
      .from('subscriptions')
      .update({
        cancel_at_period_end: body.cancelAtPeriodEnd,
        paystack_email_token: paystackEmailToken,
        paystack_subscription_code: paystackSubscriptionCode,
        status: body.cancelAtPeriodEnd && subscription.plan_name === 'free' ? 'cancelled' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userData.user.id)
      .select('*')
      .single()

    if (updateError) throw updateError

    return jsonResponse({ subscription: updatedSubscription }, 200, request)
  } catch (error) {
    console.error('paystack-update-subscription-cancellation failed', error)
    if (isRateLimitError(error)) return jsonResponse({ error: error.message }, error.status, request)
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unexpected Paystack cancellation error.' }, 500, request)
  }
})
