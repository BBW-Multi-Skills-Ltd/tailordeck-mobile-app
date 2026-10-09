import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.107.0'
import { requiredEnv } from './env.ts'

// Service-role client and request authentication shared by all Edge Functions.

// No generated DB types for edge functions, so the schema is left untyped.
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore no-explicit-any
export type ServiceClient = SupabaseClient<any, 'public', any>
/* eslint-enable @typescript-eslint/no-explicit-any */

export function createServiceClient(): ServiceClient {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** The bearer token from the Authorization header, or '' when there is none. */
export function bearerToken(request: Request): string {
  const header = request.headers.get('authorization') ?? ''
  return header.toLowerCase().startsWith('bearer ') ? header.slice('bearer '.length).trim() : ''
}

/** The signed-in user who sent the request (JWT verified by Supabase Auth), or null. */
export async function getRequestUser(request: Request, admin: ServiceClient): Promise<User | null> {
  const token = bearerToken(request)
  if (!token) return null
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

/**
 * The session's authenticator assurance level ('aal1' password only, 'aal2' after a two-step code).
 * Read from the token payload; only call after getRequestUser has verified the token.
 */
export function sessionAssuranceLevel(request: Request): string {
  const payload = bearerToken(request).split('.')[1]
  if (!payload) return ''
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '='))
    return String((JSON.parse(json) as { aal?: unknown }).aal ?? '')
  } catch {
    return ''
  }
}

/**
 * True when the user is listed in admin_users with the given role AND signed in with two-step login (aal2),
 * matching public.is_admin() in the database.
 */
export async function hasAdminRole(admin: ServiceClient, request: Request, userId: string, role: 'website' | 'support'): Promise<boolean> {
  if (sessionAssuranceLevel(request) !== 'aal2') return false
  const { data, error } = await admin.from('admin_users').select('roles').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return ((data as { roles: string[] } | null)?.roles ?? []).includes(role)
}
