export const AUTH_PREVIEW_KEY = 'tailordeck-auth-preview'
export const ONBOARDING_DONE_KEY = 'tailordeck-onboarding-done'
export const ONBOARDING_STAGE_KEY = 'tailordeck-onboarding-stage'
export const AUTH_ACCOUNTS_KEY = 'tailordeck-auth-accounts'
export const AUTH_ACTIVE_EMAIL_KEY = 'tailordeck-auth-active-email'

export type OnboardingStage = 'welcome' | 'setup' | 'plan' | 'done'

export interface LocalAuthAccount {
  fullName: string
  email: string
  phone: string
  password: string
  createdAt: string
}

export function isPreviewAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(AUTH_PREVIEW_KEY) !== null
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false
  return getOnboardingStage() === 'done'
}

export function setPreviewAuthenticated(mode: 'signed-in' | 'signed-up'): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_PREVIEW_KEY, mode)
}

export function clearPreviewSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_PREVIEW_KEY)
  window.localStorage.removeItem(AUTH_ACTIVE_EMAIL_KEY)
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

export function getOnboardingStage(): OnboardingStage {
  if (typeof window === 'undefined') return 'welcome'
  const doneLegacy = window.localStorage.getItem(ONBOARDING_DONE_KEY) === 'true'
  const raw = window.localStorage.getItem(ONBOARDING_STAGE_KEY)
  if (raw === 'setup' || raw === 'plan' || raw === 'done' || raw === 'welcome') return raw
  if (doneLegacy) {
    window.localStorage.setItem(ONBOARDING_STAGE_KEY, 'done')
    return 'done'
  }
  return 'welcome'
}

function loadAccounts(): LocalAuthAccount[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(AUTH_ACCOUNTS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as LocalAuthAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAccounts(accounts: LocalAuthAccount[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function registerLocalAccount(input: Omit<LocalAuthAccount, 'createdAt'>): LocalAuthAccount {
  const email = input.email.trim().toLowerCase()
  const next: LocalAuthAccount = {
    fullName: input.fullName.trim() || 'Tailor',
    email,
    phone: input.phone.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  }

  const accounts = loadAccounts()
  const existingIndex = accounts.findIndex((item) => item.email === email)
  if (existingIndex >= 0) {
    accounts[existingIndex] = { ...accounts[existingIndex], ...next }
  } else {
    accounts.push(next)
  }
  saveAccounts(accounts)
  return next
}

export function signInWithLocalAccount(emailInput: string, passwordInput: string): boolean {
  const email = emailInput.trim().toLowerCase()
  const password = passwordInput
  const accounts = loadAccounts()
  const account = accounts.find((item) => item.email === email && item.password === password)
  if (!account || typeof window === 'undefined') return false

  setPreviewAuthenticated('signed-in')
  window.localStorage.setItem(AUTH_ACTIVE_EMAIL_KEY, account.email)
  return true
}
