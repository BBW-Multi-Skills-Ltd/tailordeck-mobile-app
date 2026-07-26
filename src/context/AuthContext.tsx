import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue } from './authContextCore'
import { syncPendingOnboardingSettings } from '../services/onboardingService'

const AUTH_BOOT_TIMEOUT_MS = 5000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const timeoutId = window.setTimeout(() => {
      if (!mounted) return
      setLoading(false)
    }, AUTH_BOOT_TIMEOUT_MS)

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return
        window.clearTimeout(timeoutId)
        if (error) {
          setSession(null)
        } else {
          setSession(data.session)
        }
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        window.clearTimeout(timeoutId)
        setSession(null)
        setLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.clearTimeout(timeoutId)
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      window.clearTimeout(timeoutId)
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user.id) return
    syncPendingOnboardingSettings().catch((error) => {
      console.warn('Unable to sync pending onboarding settings:', error)
    })
  }, [session?.user.id])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signOut: async () => {
        await supabase.auth.signOut()
        setSession(null)
      },
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
