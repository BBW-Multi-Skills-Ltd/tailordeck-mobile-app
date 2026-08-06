import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'
import { corsHeadersForRequest, handleOptions, jsonResponse } from '../_shared/cors.ts'
import { enforceRateLimit, isRateLimitError } from '../_shared/rateLimit.ts'

type AccountLifecycleEvent = 'account_deactivated' | 'account_deletion_requested' | 'account_restored'

type Profile = {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  account_status: string | null
  deletion_scheduled_at: string | null
}

const allowedEvents = new Set<AccountLifecycleEvent>([
  'account_deactivated',
  'account_deletion_requested',
  'account_restored',
])

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function adminClient() {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

function userClient(authHeader: string) {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  })
}

function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return map[char] ?? char
  })
}

function formatDate(value: string | null): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date(value))
}

function messageFor(eventType: AccountLifecycleEvent, profile: Profile): { subject: string; title: string; body: string; action?: string } {
  const name = profile.full_name?.trim() || 'TailorDeck user'
  const appUrl = Deno.env.get('APP_URL') || 'https://tailor-deck.vercel.app'

  if (eventType === 'account_deletion_requested') {
    return {
      subject: 'TailorDeck account deletion requested',
      title: 'Account deletion requested',
      body: `${name}, your TailorDeck account is locked and scheduled for permanent deletion on ${formatDate(profile.deletion_scheduled_at)}. If this was a mistake, sign in before that date to restore your account.`,
      action: `${appUrl}/account-status`,
    }
  }

  if (eventType === 'account_deactivated') {
    return {
      subject: 'TailorDeck account deactivated',
      title: 'Account deactivated',
      body: `${name}, your TailorDeck account has been paused. Your shop data is still kept safely. You can sign in again when you want to restore access.`,
      action: `${appUrl}/account-status`,
    }
  }

  return {
    subject: 'TailorDeck account restored',
    title: 'Account restored',
    body: `${name}, your TailorDeck account has been restored. You can continue managing your shop, jobs, clients, invoices, and settings.`,
    action: appUrl,
  }
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, request)
  }

  try {
    const authHeader = request.headers.get('Authorization') ?? ''
    if (!authHeader) return jsonResponse({ error: 'Missing authorization header' }, 401, request)

    const userSupabase = userClient(authHeader)
    const { data: userData, error: userError } = await userSupabase.auth.getUser()
    if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { eventType } = await request.json()
    if (typeof eventType !== 'string' || !allowedEvents.has(eventType as AccountLifecycleEvent)) {
      return jsonResponse({ error: 'Invalid account lifecycle event.' }, 400, request)
    }

    const admin = adminClient()
    await enforceRateLimit({
      action: 'account_lifecycle_notify',
      actorId: userData.user.id,
      admin,
      limit: 10,
      windowSeconds: 60 * 60,
    })

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id,user_id,full_name,email,account_status,deletion_scheduled_at')
      .eq('user_id', userData.user.id)
      .maybeSingle<Profile>()

    if (profileError) throw profileError
    if (!profile) return jsonResponse({ error: 'Profile not found.' }, 404, request)

    const to = profile.email || userData.user.email
    if (!to) return jsonResponse({ error: 'No account email found.' }, 400, request)

    const resendApiKey = requiredEnv('RESEND_API_KEY')
    const from = Deno.env.get('RESEND_FROM_EMAIL') || 'TailorDeck Support <support@tailordeck.com.ng>'
    const content = messageFor(eventType as AccountLifecycleEvent, profile)
    const actionMarkup = content.action
      ? `<p><a href="${htmlEscape(content.action)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#7B1E37;color:#fff;text-decoration:none;font-weight:700;">Open TailorDeck</a></p>`
      : ''

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f241f;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#7B1E37;margin:0 0 12px;">${htmlEscape(content.title)}</h2>
        <p>${htmlEscape(content.body)}</p>
        ${actionMarkup}
        <p style="font-size:12px;color:#8B7A70;margin-top:20px;">TailorDeck is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.</p>
        <p style="font-size:12px;color:#8B7A70;margin-top:24px;">If you did not make this change, contact TailorDeck support immediately.</p>
      </div>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: content.subject,
        html,
      }),
    })

    if (!resendResponse.ok) {
      const text = await resendResponse.text()
      throw new Error(`Resend account email failed: ${text}`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeadersForRequest(request), 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const status = isRateLimitError(error) ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to send account lifecycle email.'
    return jsonResponse({ error: message }, status, request)
  }
})
