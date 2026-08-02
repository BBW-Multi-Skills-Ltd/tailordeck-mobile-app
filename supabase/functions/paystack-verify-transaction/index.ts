import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import {
  createAdminClient,
  createUserClient,
  getRequiredEnv,
  updateSubscriptionFromCharge,
  type PaystackVerifyResponse,
} from '../_shared/paystack.ts'
import { enforceRateLimit, isRateLimitError } from '../_shared/rateLimit.ts'

type VerifyBody = {
  reference?: string
}

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Missing Authorization header' }, 401, request)

    const body = (await request.json()) as VerifyBody
    if (!body.reference) return jsonResponse({ error: 'Payment reference is required.' }, 400, request)

    const userClient = createUserClient(authHeader)
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    await enforceRateLimit({
      action: 'paystack_verify_transaction',
      actorId: userData.user.id,
      admin: createAdminClient(),
      limit: 20,
      windowSeconds: 600,
    })

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(body.reference)}`, {
      headers: {
        Authorization: `Bearer ${getRequiredEnv('PAYSTACK_SECRET_KEY')}`,
      },
    })
    const paystackBody = (await paystackResponse.json()) as PaystackVerifyResponse
    if (!paystackResponse.ok || !paystackBody.status || !paystackBody.data) {
      return jsonResponse({ error: paystackBody.message || 'Unable to verify Paystack payment.' }, 400, request)
    }

    if (paystackBody.data.status !== 'success') {
      return jsonResponse({ error: 'Payment has not been completed.' }, 400, request)
    }

    if (paystackBody.data.metadata?.user_id !== userData.user.id) {
      return jsonResponse({ error: 'Payment does not belong to this account.' }, 403, request)
    }

    const subscription = await updateSubscriptionFromCharge(paystackBody.data)
    return jsonResponse({ subscription }, 200, request)
  } catch (error) {
    if (isRateLimitError(error)) return jsonResponse({ error: error.message }, error.status, request)
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unexpected verification error.' }, 500, request)
  }
})
