import { type NavigateFunction } from 'react-router-dom'
import { markOnboardingStage } from '../../lib/auth'
import { loadTailorSettings } from '../../lib/settings'
import { syncPendingOnboardingSettings } from '../../services/onboardingService'
import { activateVerifiedProfile } from '../../services/profileService'
import { clearPendingVerification, type PendingVerification } from './verifyEmailStorage'

type CompleteVerifiedEmailParams = {
  email: string
  navigate: NavigateFunction
  pending: PendingVerification
}

export async function completeVerifiedEmail({ email, navigate, pending }: CompleteVerifiedEmailParams): Promise<void> {
  const settings = loadTailorSettings()

  await activateVerifiedProfile({
    email: email.trim().toLowerCase(),
    fullName: pending.fullName || settings.profile.fullName,
    phone: pending.phone || settings.profile.phone,
  })

  try {
    await syncPendingOnboardingSettings(settings)
  } catch (syncError) {
    console.warn('Email verified, but onboarding sync will be retried later:', syncError)
  }

  clearPendingVerification()
  markOnboardingStage(pending.setupWasCompleted ? 'plan' : 'setup')
  navigate(pending.setupWasCompleted ? '/onboarding/plan' : '/onboarding/setup', { replace: true })
}
