import { TAILOR_PENDING_EMAIL_VERIFICATION_KEY } from '../../lib/settings'

export type PendingVerification = {
  codeSentAt: number
  email: string
  fullName: string
  phone: string
  resendCount: number
  resendLockedUntil: number
  setupWasCompleted: boolean
}

export function loadPendingVerification(): PendingVerification {
  const fallback: PendingVerification = {
    codeSentAt: Date.now(),
    email: '',
    fullName: '',
    phone: '',
    resendCount: 0,
    resendLockedUntil: 0,
    setupWasCompleted: true,
  }

  if (typeof window === 'undefined') return fallback

  const raw = window.localStorage.getItem(TAILOR_PENDING_EMAIL_VERIFICATION_KEY)
  if (!raw) return fallback

  try {
    const parsed = JSON.parse(raw) as Partial<PendingVerification>
    return {
      codeSentAt: typeof parsed.codeSentAt === 'number' ? parsed.codeSentAt : fallback.codeSentAt,
      email: parsed.email?.trim().toLowerCase() || fallback.email,
      fullName: parsed.fullName?.trim() || fallback.fullName,
      phone: parsed.phone?.trim() || fallback.phone,
      resendCount: typeof parsed.resendCount === 'number' ? parsed.resendCount : fallback.resendCount,
      resendLockedUntil: typeof parsed.resendLockedUntil === 'number' ? parsed.resendLockedUntil : fallback.resendLockedUntil,
      setupWasCompleted: parsed.setupWasCompleted ?? fallback.setupWasCompleted,
    }
  } catch {
    return fallback
  }
}

export function persistPendingVerification(next: PendingVerification): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TAILOR_PENDING_EMAIL_VERIFICATION_KEY, JSON.stringify(next))
}

export function clearPendingVerification(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TAILOR_PENDING_EMAIL_VERIFICATION_KEY)
}
