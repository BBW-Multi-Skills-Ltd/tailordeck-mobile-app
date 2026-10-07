import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AdminRole = 'website' | 'support'

export type AdminSessionState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; session: Session; roles: AdminRole[] }

async function loadRoles(): Promise<AdminRole[]> {
  // Server-side check (admin_users + RLS); the UI only reflects what the database allows.
  const { data, error } = await supabase.rpc('get_my_admin_roles')
  if (error) throw error
  return (Array.isArray(data) ? data : []).filter((role): role is AdminRole => role === 'website' || role === 'support')
}

/** Current Supabase session plus the signed-in user's admin roles. */
export function useAdminSession() {
  const [state, setState] = useState<AdminSessionState>({ status: 'loading' })

  const refresh = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({ status: 'signed-out' })
      return
    }
    try {
      setState({ status: 'signed-in', session, roles: await loadRoles() })
    } catch {
      setState({ status: 'signed-in', session, roles: [] })
    }
  }, [])

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) void refresh(data.session)
    })
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return
      void refresh(session)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [refresh])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ status: 'signed-out' })
  }, [])

  return { state, signOut }
}
