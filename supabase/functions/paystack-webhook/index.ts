import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient, updateSubscriptionFromCharge, type PaystackVerifyResponse } from '../_shared/paystack.ts'

type PaystackWebhookEvent = {
  event?: string
  data?: PaystackVerifyResponse['data'] & {
    subscription_code?: string
  }
}

function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function isValidPaystackSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { hash: 'SHA-512', name: 'HMAC' }, false, ['sign'])
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  return bytesToHex(digest) === signature
}

async function markPaymentFailed(reference: string | undefined) {
  if (!reference) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('subscriptions')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('pending_payment_reference', reference)

  if (error) throw error
}

async function markSubscriptionDisabled(subscriptionCode: string | undefined) {
  if (!subscriptionCode) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('paystack_subscription_code', subscriptionCode)

  if (error) throw error
}

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

    const rawBody = await request.text()
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!secret) return jsonResponse({ error: 'Missing Paystack secret.' }, 500, request)

    const signature = request.headers.get('x-paystack-signature')
    const signatureIsValid = await isValidPaystackSignature(rawBody, signature, secret)
    if (!signatureIsValid) return jsonResponse({ error: 'Invalid webhook signature.' }, 401, request)

    const event = JSON.parse(rawBody) as PaystackWebhookEvent

    if (event.event === 'charge.success' && event.data?.status === 'success') {
      await updateSubscriptionFromCharge(event.data)
    }

    if (event.event === 'charge.failed') {
      await markPaymentFailed(event.data?.reference)
    }

    if (event.event === 'subscription.disable') {
      await markSubscriptionDisabled(event.data?.subscription?.subscription_code || event.data?.subscription_code)
    }

    return jsonResponse({ received: true }, 200, request)
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unexpected webhook error.' }, 500, request)
  }
})
