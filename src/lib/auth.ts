const LEGACY_AUTH_PREVIEW_KEY = 'tailordeck-auth-preview'
const LEGACY_AUTH_ACTIVE_EMAIL_KEY = 'tailordeck-auth-active-email'
const LEGACY_AUTH_ACCOUNTS_KEY = 'tailordeck-auth-accounts'

const ONBOARDING_DONE_KEY = 'tailordeck-onboarding-done'
const ONBOARDING_STAGE_KEY = 'tailordeck-onboarding-stage'

export type OnboardingStage = 'welcome' | 'setup' | 'plan' | 'done'

export function hasStartedDeviceOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ONBOARDING_STAGE_KEY) !== null || window.localStorage.getItem(ONBOARDING_DONE_KEY) === 'true'
}

export function clearPreviewSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LEGACY_AUTH_PREVIEW_KEY)
  window.localStorage.removeItem(LEGACY_AUTH_ACTIVE_EMAIL_KEY)
  window.localStorage.removeItem(LEGACY_AUTH_ACCOUNTS_KEY)
}

export function markOnboardingCompleted(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ONBOARDING_STAGE_KEY, 'done')
  window.localStorage.setItem(ONBOARDING_DONE_KEY, 'true')
}

export function markOnboardingStage(stage: OnboardingStage): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ONBOARDING_STAGE_KEY, stage)
  if (stage === 'done') {
    window.localStorage.setItem(ONBOARDING_DONE_KEY, 'true')
  } else {
    window.localStorage.removeItem(ONBOARDING_DONE_KEY)
  }
}
