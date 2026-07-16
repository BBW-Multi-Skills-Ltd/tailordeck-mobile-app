import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
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

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      window.clearTimeout(timeoutId)
      if (error) {
        setSession(null)
      } else {
        setSession(data.session)
      }
      setLoading(false)
    }).catch(() => {
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

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    signOut: async () => {
      await supabase.auth.signOut()
      setSession(null)
    },
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
