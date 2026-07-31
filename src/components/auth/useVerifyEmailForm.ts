import { useMemo, useState, type ClipboardEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { markOnboardingStage } from '../../lib/auth'
import { loadTailorSettings, TAILOR_PENDING_EMAIL_VERIFICATION_KEY } from '../../lib/settings'
import { resendSignUpEmailOtp, verifySignUpEmailOtp } from '../../services/authService'
import { syncPendingOnboardingSettings } from '../../services/onboardingService'
import { updateProfile } from '../../services/profileService'

type PendingVerification = {
  email: string
  fullName: string
  phone: string
  setupWasCompleted: boolean
}

function loadPendingVerification(): PendingVerification {
  const fallback: PendingVerification = {
    email: '',
    fullName: '',
    phone: '',
    setupWasCompleted: true,
  }

  if (typeof window === 'undefined') return fallback

  const raw = window.localStorage.getItem(TAILOR_PENDING_EMAIL_VERIFICATION_KEY)
  if (!raw) return fallback

  try {
    const parsed = JSON.parse(raw) as Partial<PendingVerification>
    return {
      email: parsed.email?.trim().toLowerCase() || fallback.email,
      fullName: parsed.fullName?.trim() || fallback.fullName,
      phone: parsed.phone?.trim() || fallback.phone,
      setupWasCompleted: parsed.setupWasCompleted ?? fallback.setupWasCompleted,
    }
  } catch {
    return fallback
  }
}

export function useVerifyEmailForm() {
  const navigate = useNavigate()
  const pending = useMemo(() => loadPendingVerification(), [])
  const [email, setEmail] = useState(pending.email)
  const [digits, setDigits] = useState<string[]>(Array.from({ length: 6 }, () => ''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [errorKey, setErrorKey] = useState(0)

  const token = digits.join('')

  function setDigit(index: number, value: string): void {
    const nextDigit = value.replace(/\D/g, '').slice(-1)
    setDigits((current) => current.map((item, itemIndex) => (itemIndex === index ? nextDigit : item)))
    setError('')

    if (nextDigit) {
      const nextInput = document.querySelector<HTMLInputElement>(`[data-otp-index="${index + 1}"]`)
      nextInput?.focus()
    }
  }

  function handleKeyDown(index: number, key: string): void {
    if (key !== 'Backspace' || digits[index]) return
    const previousInput = document.querySelector<HTMLInputElement>(`[data-otp-index="${index - 1}"]`)
    previousInput?.focus()
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    setDigits(Array.from({ length: 6 }, (_, index) => pasted[index] ?? ''))
    setError('')
  }

  function validate(): boolean {
    if (!email.trim()) {
      setError('Enter your email address.')
      setErrorKey((current) => current + 1)
      return false
    }
    if (!/^\d{6}$/.test(token)) {
      setError('Enter the 6-digit code.')
      setErrorKey((current) => current + 1)
      return false
    }
    return true
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setNotice('')
    if (!validate()) return

    setLoading(true)
    try {
      await verifySignUpEmailOtp({ email, token })
      const settings = loadTailorSettings()
      await updateProfile({
        email: email.trim().toLowerCase(),
        full_name: pending.fullName || settings.profile.fullName,
        phone: pending.phone || settings.profile.phone,
      })
      await syncPendingOnboardingSettings(settings)
      window.localStorage.removeItem(TAILOR_PENDING_EMAIL_VERIFICATION_KEY)
      markOnboardingStage(pending.setupWasCompleted ? 'plan' : 'setup')
      navigate(pending.setupWasCompleted ? '/onboarding/plan' : '/onboarding/setup', { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to verify this code.')
      setErrorKey((current) => current + 1)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend(): Promise<void> {
    setError('')
    setNotice('')
    if (!email.trim()) {
      setError('Enter your email address.')
      setErrorKey((current) => current + 1)
      return
    }

    setResending(true)
    try {
      await resendSignUpEmailOtp(email)
      setNotice('A new code has been sent.')
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Unable to resend code.')
      setErrorKey((current) => current + 1)
    } finally {
      setResending(false)
    }
  }

  return {
    digits,
    email,
    error,
    errorKey,
    handleKeyDown,
    handlePaste,
    handleResend,
    handleSubmit,
    loading,
    notice,
    resending,
    setDigit,
    setEmail,
  }
}
