// OAuth access tokens for Google service accounts (Android Publisher API, Firebase Cloud Messaging).
// Signs a JWT with the account's private key and exchanges it; tokens are cached per account and scope.

export type ServiceAccount = { client_email: string; private_key: string; token_uri: string }

export const DEFAULT_GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export class GoogleTokenError extends Error {
  constructor(public status: number, detail = '') {
    super(`Google OAuth returned ${status}${detail ? `: ${detail}` : ''}`)
  }
}

const cache = new Map<string, { token: string; expiresAt: number }>()

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes.buffer
}

async function signedAssertion(account: ServiceAccount, scope: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64UrlEncode(
    JSON.stringify({ iss: account.client_email, scope, aud: account.token_uri, iat: now, exp: now + 3600 }),
  )}`
  const key = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(account.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function getServiceAccountAccessToken(account: ServiceAccount, scope: string): Promise<string> {
  const cacheKey = `${account.client_email}|${scope}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token

  const response = await fetch(account.token_uri || DEFAULT_GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: await signedAssertion(account, scope) }),
  })
  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 500)
    throw new GoogleTokenError(response.status, detail)
  }
  const data = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('Google OAuth response missing access token.')
  cache.set(cacheKey, { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 })
  return data.access_token
}
