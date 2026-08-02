import { type NavigateFunction } from 'react-router-dom'
import { markOnboardingStage } from '../../lib/auth'
import {
  loadTailorSettings,
  saveTailorSettings,
  TAILOR_PENDING_EMAIL_VERIFICATION_KEY,
  TAILOR_SIGNUP_PREFILL_KEY,
} from '../../lib/settings'
import { syncPendingOnboardingSettings } from '../../services/onboardingService'

type SavePendingSignUpParams = {
  fullName: string
  normalizedEmail: string
  normalizedPhone: string
  setupWasCompleted: boolean
}

export function savePendingSignUpHandoff({ fullName, normalizedEmail, normalizedPhone, setupWasCompleted }: SavePendingSignUpParams) {
  const currentSettings = loadTailorSettings()
  const nextSettings = saveTailorSettings({
    ...currentSettings,
    profile: {
      ...currentSettings.profile,
      fullName: fullName.trim() || currentSettings.profile.fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
    },
  })

  window.localStorage.setItem(
    TAILOR_PENDING_EMAIL_VERIFICATION_KEY,
    JSON.stringify({
      codeSentAt: Date.now(),
      email: normalizedEmail,
      fullName: nextSettings.profile.fullName,
      phone: normalizedPhone,
      resendCount: 0,
      resendLockedUntil: 0,
      setupWasCompleted,
    }),
  )
  window.localStorage.setItem(
    TAILOR_SIGNUP_PREFILL_KEY,
    JSON.stringify({
      email: normalizedEmail,
      fullName: nextSettings.profile.fullName,
      shopName: nextSettings.businessInfo.shopName,
    }),
  )

  return nextSettings
}

type CompleteAuthenticatedSignUpParams = {
  navigate: NavigateFunction
  nextSettings: ReturnType<typeof loadTailorSettings>
  setupWasCompleted: boolean
}

export async function completeAuthenticatedSignUp({ navigate, nextSettings, setupWasCompleted }: CompleteAuthenticatedSignUpParams): Promise<void> {
  try {
    await syncPendingOnboardingSettings(nextSettings)
  } catch (syncError) {
    console.warn('Unable to sync onboarding settings after signup:', syncError)
  }

  markOnboardingStage(setupWasCompleted ? 'plan' : 'setup')
  navigate(setupWasCompleted ? '/onboarding/plan' : '/onboarding/setup')
}
