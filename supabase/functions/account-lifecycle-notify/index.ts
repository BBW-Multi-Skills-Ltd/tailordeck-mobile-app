import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import { emailShell, htmlEscape, sendEmail } from '../_shared/email.ts'
import { enforceRateLimit, isRateLimitError } from '../_shared/rateLimit.ts'
import { createServiceClient, getRequestUser } from '../_shared/supabase.ts'

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
  const appUrl = Deno.env.get('APP_URL') || 'https://tailordeck.app'

  if (eventType === 'account_deletion_requested') {
    return {
      subject: 'TailorDeck account deletion requested',
      title: 'Account deletion requested',
      body: `${name}, your TailorDeck account is locked and scheduled for permanent deletion on ${formatDate(profile.deletion_scheduled_at)}. If this was a mistake, sign in to the TailorDeck app before that date to restore your account.`,
      action: appUrl,
    }
  }

  if (eventType === 'account_deactivated') {
    return {
      subject: 'TailorDeck account deactivated',
      title: 'Account deactivated',
      body: `${name}, your TailorDeck account has been paused. Your shop data is still kept safely. Sign in to the TailorDeck app again when you want to restore access.`,
      action: appUrl,
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
    const admin = createServiceClient()
    const user = await getRequestUser(request, admin)
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { eventType } = await request.json()
    if (typeof eventType !== 'string' || !allowedEvents.has(eventType as AccountLifecycleEvent)) {
      return jsonResponse({ error: 'Invalid account lifecycle event.' }, 400, request)
    }

    await enforceRateLimit({
      action: 'account_lifecycle_notify',
      actorId: user.id,
      admin,
      limit: 10,
      windowSeconds: 60 * 60,
    })

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id,user_id,full_name,email,account_status,deletion_scheduled_at')
      .eq('user_id', user.id)
      .maybeSingle<Profile>()

    if (profileError) throw profileError
    if (!profile) return jsonResponse({ error: 'Profile not found.' }, 404, request)

    const to = profile.email || user.email
    if (!to) return jsonResponse({ error: 'No account email found.' }, 400, request)

    const content = messageFor(eventType as AccountLifecycleEvent, profile)
    const actionMarkup = content.action
      ? `<p><a href="${htmlEscape(content.action)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#7B1E37;color:#fff;text-decoration:none;font-weight:700;">Get the TailorDeck app</a></p>`
      : ''
    const html = emailShell(content.title, `<p>${htmlEscape(content.body)}</p>${actionMarkup}`, 'If you did not make this change, contact TailorDeck support immediately.')

    const sent = await sendEmail({ to, subject: content.subject, html })
    if (!sent.ok) throw new Error(`Resend account email failed: ${sent.detail}`)

    return jsonResponse({ ok: true }, 200, request)
  } catch (error) {
    const status = isRateLimitError(error) ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unable to send account lifecycle email.'
    return jsonResponse({ error: message }, status, request)
  }
})
