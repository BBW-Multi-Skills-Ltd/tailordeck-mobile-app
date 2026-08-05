import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import {
  createAdminClient,
  createUserClient,
  getPaystackPlanCode,
  getRequiredEnv,
  paidPlanPricesKobo,
  type BillingCycle,
  type PaidPlanName,
} from '../_shared/paystack.ts'
import { enforceRateLimit, isRateLimitError } from '../_shared/rateLimit.ts'

type InitializeBody = {
  billingCycle?: BillingCycle
  planName?: PaidPlanName
}

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Missing Authorization header' }, 401, request)

    const body = (await request.json()) as InitializeBody
    const planName = body.planName
    const billingCycle = body.billingCycle ?? 'monthly'
    if (planName !== 'starter' && planName !== 'pro') return jsonResponse({ error: 'Invalid plan' }, 400, request)
    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') return jsonResponse({ error: 'Invalid billing cycle' }, 400, request)

    const userClient = createUserClient(authHeader)
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const admin = createAdminClient()
    await enforceRateLimit({
      action: 'paystack_initialize_subscription',
      actorId: userData.user.id,
      admin,
      limit: 10,
      windowSeconds: 600,
    })

    const { data: profile } = await admin.from('profiles').select('full_name,email').eq('user_id', userData.user.id).maybeSingle()
    const email = profile?.email || userData.user.email
    if (!email) return jsonResponse({ error: 'User email is required for Paystack checkout.' }, 400, request)

    const reference = `td_${userData.user.id.replaceAll('-', '').slice(0, 12)}_${Date.now()}`
    const callbackUrl = `${Deno.env.get('APP_URL') || request.headers.get('origin') || 'http://localhost:5173'}/billing/callback`
    const planCode = getPaystackPlanCode(planName, billingCycle)
    const payload: Record<string, unknown> = {
      amount: paidPlanPricesKobo[planName][billingCycle],
      callback_url: callbackUrl,
      channels: ['card'],
      currency: 'NGN',
      email,
      metadata: {
        billing_cycle: billingCycle,
        full_name: profile?.full_name ?? '',
        plan_name: planName,
        user_id: userData.user.id,
      },
      reference,
    }

    if (planCode) payload.plan = planCode

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${getRequiredEnv('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const paystackBody = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackBody.status) {
      return jsonResponse({ error: paystackBody.message || 'Unable to initialize Paystack checkout.' }, 400, request)
    }

    await admin
      .from('subscriptions')
      .update({
        billing_cycle: billingCycle,
        payment_status: 'pending',
        pending_payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userData.user.id)

    return jsonResponse({
      authorizationUrl: paystackBody.data.authorization_url,
      reference,
    }, 200, request)
  } catch (error) {
    if (isRateLimitError(error)) return jsonResponse({ error: error.message }, error.status, request)
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unexpected Paystack error.' }, 500, request)
  }
})
