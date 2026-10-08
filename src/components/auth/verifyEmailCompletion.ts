import type { QueryClient } from '@tanstack/react-query'
import { type NavigateFunction } from 'react-router-dom'
import { queryKeys } from '../../hooks/queryKeys'
import { markOnboardingStage } from '../../lib/auth'
import { loadTailorSettings } from '../../lib/settings'
import { syncPendingOnboardingSettings } from '../../services/onboardingService'
import { activateVerifiedProfile } from '../../services/profileService'
import { clearPendingVerification, type PendingVerification } from './verifyEmailStorage'

type CompleteVerifiedEmailParams = {
  email: string
  navigate: NavigateFunction
  pending: PendingVerification
  queryClient: QueryClient
}

export async function completeVerifiedEmail({ email, navigate, pending, queryClient }: CompleteVerifiedEmailParams): Promise<void> {
  const settings = loadTailorSettings()

  await activateVerifiedProfile({
    email: email.trim().toLowerCase(),
    fullName: pending.fullName || settings.profile.fullName,
    phone: pending.phone || settings.profile.phone,
  })

  // The moment the code is accepted the user is signed in, and background components may already have
  // loaded the profile while it still said 'pending_verification'. Drop those copies, otherwise the route
  // guard reads the stale status and sends the user back to the code screen.
  const accountQueries = [queryKeys.profile, queryKeys.settings, queryKeys.subscription]
  await Promise.all(accountQueries.map((queryKey) => queryClient.cancelQueries({ queryKey })))
  for (const queryKey of accountQueries) queryClient.removeQueries({ queryKey })

  try {
    await syncPendingOnboardingSettings(settings)
  } catch (syncError) {
    console.warn('Email verified, but onboarding sync will be retried later:', syncError)
  }

  clearPendingVerification()
  markOnboardingStage(pending.setupWasCompleted ? 'plan' : 'setup')
  navigate(pending.setupWasCompleted ? '/onboarding/plan' : '/onboarding/setup', { replace: true })
}
