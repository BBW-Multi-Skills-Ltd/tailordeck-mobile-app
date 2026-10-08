import { handleOptions, jsonResponse } from '../_shared/cors.ts'
import { requiredEnv } from '../_shared/env.ts'
import { createServiceClient, getRequestUser, hasAdminRole } from '../_shared/supabase.ts'

// Signs a Cloudinary upload for the admin website manager (demo video), only for admins with the 'website' role.
// The browser then uploads the file straight to Cloudinary; the API secret never leaves this function.

const UPLOAD_FOLDER = 'tailordeck/marketing'

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, request)

  try {
    const admin = createServiceClient()
    const user = await getRequestUser(request, admin)
    if (!user) return jsonResponse({ error: 'Authentication required.' }, 401, request)
    if (!(await hasAdminRole(admin, user.id, 'website'))) return jsonResponse({ error: 'Website admin access required.' }, 403, request)

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
