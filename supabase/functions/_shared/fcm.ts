import { getServiceAccountAccessToken, type ServiceAccount } from './googleAuth.ts'
import type { ServiceClient } from './supabase.ts'

// Firebase Cloud Messaging (HTTP v1). The service-account key is the FIREBASE_SERVICE_ACCOUNT_B64 secret
// (base64 of the JSON key). Invalid / uninstalled device tokens are removed from push_tokens.

type FirebaseServiceAccount = ServiceAccount & { project_id: string }

export type PushMessage = { title: string; body: string; data?: Record<string, string> }

const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'

function serviceAccount(): FirebaseServiceAccount {
  const encoded = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_B64')
  if (!encoded) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_B64')
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0))))
}

/** Sends a push to every device of the user. Returns how many devices accepted it. */
export async function sendPushToUser(admin: ServiceClient, userId: string, message: PushMessage): Promise<number> {
  const { data: rows, error } = await admin.from('push_tokens').select('token').eq('user_id', userId)
  if (error) throw error
  const tokens = (rows ?? []).map((row: { token: string }) => row.token)
  if (!tokens.length) return 0

  const account = serviceAccount()
  const bearer = await getServiceAccountAccessToken(account, FCM_SCOPE)
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
