import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'

// Firebase Cloud Messaging (HTTP v1). The service-account key is the FIREBASE_SERVICE_ACCOUNT_B64 secret
// (base64 of the JSON key). Invalid / uninstalled device tokens are removed from push_tokens.

type ServiceAccount = { project_id: string; client_email: string; private_key: string; token_uri: string }

export type PushMessage = { title: string; body: string; data?: Record<string, string> }

let cachedToken: { value: string; expiresAt: number } | null = null

function serviceAccount(): ServiceAccount {
  const encoded = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_B64')
  if (!encoded) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_B64')
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0))))
}

const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const encodeJson = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)))

async function accessToken(account: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const pem = account.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')
  const key = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(pem), (char) => char.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${encodeJson({ alg: 'RS256', typ: 'JWT' })}.${encodeJson({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: account.token_uri,
    iat: now,
    exp: now + 3600,
  })}`
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)))
  const response = await fetch(account.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${base64url(signature)}` }),
  })
  const result = await response.json()
  if (!response.ok || !result.access_token) throw new Error(`Firebase sign-in failed (${response.status})`)
  cachedToken = { value: result.access_token, expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000 }
  return result.access_token
}

/** Sends a push to every device of the user. Returns how many devices accepted it. */
export async function sendPushToUser(admin: SupabaseClient, userId: string, message: PushMessage): Promise<number> {
  const { data: rows, error } = await admin.from('push_tokens').select('token').eq('user_id', userId)
  if (error) throw error
  const tokens = (rows ?? []).map((row: { token: string }) => row.token)
  if (!tokens.length) return 0

  const account = serviceAccount()
  const bearer = await accessToken(account)
  let delivered = 0
  const stale: string[] = []

  await Promise.all(
    tokens.map(async (token) => {
      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            token,
            notification: { title: message.title, body: message.body },
            data: message.data ?? {},
            android: {
              priority: 'high',
              notification: { channel_id: 'support', icon: 'ic_stat_tailordeck', color: '#7B1E37' },
            },
          },
        }),
      })
      if (response.ok) {
        delivered += 1
        return
      }
      const result = await response.json().catch(() => ({}))
      const code = result?.error?.details?.find((detail: { errorCode?: string }) => detail.errorCode)?.errorCode ?? result?.error?.status
      if (code === 'UNREGISTERED' || code === 'INVALID_ARGUMENT' || response.status === 404) stale.push(token)
      else console.error('FCM send failed:', response.status, code)
    }),
  )

  if (stale.length) await admin.from('push_tokens').delete().in('token', stale)
  return delivered
}
