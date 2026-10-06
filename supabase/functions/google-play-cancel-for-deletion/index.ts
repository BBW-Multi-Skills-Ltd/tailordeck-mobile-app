import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import { cancelLinkedSubscriptionForUser, createServiceClient, getSafeErrorMessage } from '../_shared/googlePlay.ts'

// Called by the app right after the user requests account deletion: stops Google Play auto-renewal so a
// locked/deleted account is never charged again. Only works for accounts actually scheduled for deletion.
// Backups: google-play-daily-sync and process-due-account-deletions cancel renewal too if this call is missed.

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, request)

  try {
    const header = request.headers.get('authorization') ?? ''
    const accessToken = header.toLowerCase().startsWith('bearer ') ? header.slice('bearer '.length).trim() : ''
    if (!accessToken) return jsonResponse({ error: 'Authentication required.' }, 401, request)

    const supabase = createServiceClient()
    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !userData.user) return jsonResponse({ error: 'Authentication required.' }, 401, request)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('deletion_scheduled_at')
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (profileError) throw profileError
    if (!(profile as { deletion_scheduled_at: string | null } | null)?.deletion_scheduled_at) {
      return jsonResponse({ error: 'Account is not scheduled for deletion.' }, 409, request)
    }

    const result = await cancelLinkedSubscriptionForUser(supabase, userData.user.id)
    return jsonResponse({ ok: true, ...result }, 200, request)
  } catch (error) {
    console.error('Cancel-for-deletion failed:', getSafeErrorMessage(error))
    return jsonResponse({ error: 'Unable to cancel the Google Play subscription right now.' }, 502, request)
  }
})
