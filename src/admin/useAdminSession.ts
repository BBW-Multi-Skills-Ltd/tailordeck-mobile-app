import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AdminRole = 'website' | 'support'

/**
 * Two-step login state of an admin session: 'verified' (aal2, code entered), 'challenge' (has an
 * authenticator app set up, must enter its code) or 'enroll' (must set one up first).
 */
export type TwoStepState = 'verified' | 'challenge' | 'enroll'

export type AdminSessionState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; session: Session; roles: AdminRole[]; twoStep: TwoStepState }

async function loadRoles(): Promise<AdminRole[]> {
  // Server-side check (admin_users + RLS); the UI only reflects what the database allows.
  const { data, error } = await supabase.rpc('get_my_admin_roles')
  if (error) throw error
  return (Array.isArray(data) ? data : []).filter((role): role is AdminRole => role === 'website' || role === 'support')
}

async function loadTwoStepState(): Promise<TwoStepState> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error) throw error
  if (data.currentLevel === 'aal2') return 'verified'
  return data.nextLevel === 'aal2' ? 'challenge' : 'enroll'
}

/** Current Supabase session, the signed-in user's admin roles and their two-step login state. */
export function useAdminSession() {
  const [state, setState] = useState<AdminSessionState>({ status: 'loading' })

  const refresh = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({ status: 'signed-out' })
      return
    }
    try {
      const [roles, twoStep] = await Promise.all([loadRoles(), loadTwoStepState()])
      setState({ status: 'signed-in', session, roles, twoStep })
    } catch {
      setState({ status: 'signed-in', session, roles: [], twoStep: 'enroll' })
    }
  }, [])

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) void refresh(data.session)
    })
    // MFA_CHALLENGE_VERIFIED arrives after the code is accepted and moves the session to aal2.
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
