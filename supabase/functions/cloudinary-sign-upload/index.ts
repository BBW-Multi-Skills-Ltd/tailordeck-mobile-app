import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { handleOptions, jsonResponse } from '../_shared/cors.ts'

// Signs a Cloudinary upload for the admin website manager (demo video), only for admins with the 'website' role.
// The browser then uploads the file straight to Cloudinary; the API secret never leaves this function.

const UPLOAD_FOLDER = 'tailordeck/marketing'

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, request)

  try {
    const header = request.headers.get('authorization') ?? ''
    const accessToken = header.toLowerCase().startsWith('bearer ') ? header.slice('bearer '.length).trim() : ''
    if (!accessToken) return jsonResponse({ error: 'Authentication required.' }, 401, request)

    const admin = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: userData, error: userError } = await admin.auth.getUser(accessToken)
    if (userError || !userData.user) return jsonResponse({ error: 'Authentication required.' }, 401, request)

    const { data: adminRow, error: adminError } = await admin
      .from('admin_users')
      .select('roles')
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (adminError) throw adminError
    const roles = (adminRow as { roles: string[] } | null)?.roles ?? []
    if (!roles.includes('website')) return jsonResponse({ error: 'Website admin access required.' }, 403, request)

    const timestamp = Math.floor(Date.now() / 1000)
    // Cloudinary signature: alphabetically sorted params joined with &, then the API secret appended.
    const signature = await sha1Hex(`folder=${UPLOAD_FOLDER}&timestamp=${timestamp}${requiredEnv('CLOUDINARY_API_SECRET')}`)

    return jsonResponse(
      {
        cloudName: requiredEnv('CLOUDINARY_CLOUD_NAME'),
        apiKey: requiredEnv('CLOUDINARY_API_KEY'),
        folder: UPLOAD_FOLDER,
        timestamp,
        signature,
      },
      200,
      request,
    )
  } catch (error) {
    console.error('cloudinary-sign-upload failed:', error instanceof Error ? error.message : error)
    return jsonResponse({ error: 'Unable to prepare the upload right now.' }, 500, request)
  }
})
