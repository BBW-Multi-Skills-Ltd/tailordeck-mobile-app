import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.107.0'
import { requiredEnv } from './env.ts'

// Service-role client and request authentication shared by all Edge Functions.

// No generated DB types for edge functions, so the schema is left untyped.
// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceClient = SupabaseClient<any, 'public', any>

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

/** True when the user is listed in admin_users with the given role. */
export async function hasAdminRole(admin: ServiceClient, userId: string, role: 'website' | 'support'): Promise<boolean> {
  const { data, error } = await admin.from('admin_users').select('roles').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return ((data as { roles: string[] } | null)?.roles ?? []).includes(role)
}
