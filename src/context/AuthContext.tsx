import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { unregisterPushToken } from '../lib/pushNotifications'
import { clearUserLocalData } from '../lib/settingsCache'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue } from './authContextCore'
import { syncPendingOnboardingSettings } from '../services/onboardingService'
import { syncProfileEmailFromAuth } from '../services/profileService'

const AUTH_BOOT_TIMEOUT_MS = 5000

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
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

  // A different account signed in (e.g. the session expired and someone else logged in): drop the previous
  // account's cached queries before any screen reads them.
  const userId = session?.user.id ?? null
  const previousUserIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (userId && previousUserIdRef.current && previousUserIdRef.current !== userId) queryClient.clear()
    if (userId) previousUserIdRef.current = userId
  }, [queryClient, userId])

  useEffect(() => {
    if (!session?.user.id) return
    syncPendingOnboardingSettings().catch((error) => {
      console.warn('Unable to sync pending onboarding settings:', error)
    })
    syncProfileEmailFromAuth().catch((error) => {
      console.warn('Unable to sync profile email from auth:', error)
    })
  }, [session?.user.email, session?.user.id])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signOut: async () => {
        await unregisterPushToken()
        await supabase.auth.signOut()
        // Nothing of this account may stay on a shared phone: cached server data and local copies.
        queryClient.clear()
        clearUserLocalData()
        setSession(null)
      },
    }),
    [loading, queryClient, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
