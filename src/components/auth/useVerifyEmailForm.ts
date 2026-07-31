import { useCallback, useMemo, useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { markOnboardingStage } from '../../lib/auth'
import { loadTailorSettings, TAILOR_PENDING_EMAIL_VERIFICATION_KEY } from '../../lib/settings'
import { resendSignUpEmailOtp, verifySignUpEmailOtp } from '../../services/authService'
import { syncPendingOnboardingSettings } from '../../services/onboardingService'
import { updateProfile } from '../../services/profileService'
import { EMAIL_OTP_LENGTH } from '../../validation/authSchemas'

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
  const emptyDigits = useMemo(() => Array.from({ length: EMAIL_OTP_LENGTH }, () => ''), [])
  const [digits, setDigits] = useState<string[]>(emptyDigits)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const clearTimerRef = useRef<number | null>(null)
  const lastSubmittedTokenRef = useRef('')

  const token = digits.join('')

  const focusInput = useCallback((index: number): void => {
    const input = document.querySelector<HTMLInputElement>(`[data-otp-index="${index}"]`)
    input?.focus()
  }, [])

  const clearDigits = useCallback((): void => {
    setDigits(emptyDigits)
    focusInput(0)
  }, [emptyDigits, focusInput])

  const scheduleRejectedCodeClear = useCallback((): void => {
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current)
    clearTimerRef.current = window.setTimeout(() => {
      clearDigits()
      lastSubmittedTokenRef.current = ''
    }, 1200)
  }, [clearDigits])

  function validate(nextToken = token): boolean {
    if (!email.trim()) {
      setError('Enter your email address.')
      setErrorKey((current) => current + 1)
      return false
    }
    if (!new RegExp(`^\\d{${EMAIL_OTP_LENGTH}}$`).test(nextToken)) {
      setError(`Enter the ${EMAIL_OTP_LENGTH}-digit code.`)
      setErrorKey((current) => current + 1)
      return false
    }
    return true
  }

  async function submitToken(nextToken = token): Promise<void> {
    setNotice('')
    if (loading || lastSubmittedTokenRef.current === nextToken) return
    if (!validate(nextToken)) return

    lastSubmittedTokenRef.current = nextToken
    setLoading(true)
    try {
      await verifySignUpEmailOtp({ email, token: nextToken })
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
      lastSubmittedTokenRef.current = ''
      setError(submitError instanceof Error ? submitError.message : 'Unable to verify this code.')
      setErrorKey((current) => current + 1)
      scheduleRejectedCodeClear()
    } finally {
      setLoading(false)
    }
  }

  function applyCode(rawCode: string): void {
    const code = rawCode.replace(/\D/g, '').slice(0, EMAIL_OTP_LENGTH)
    if (!code) return

    const nextDigits = Array.from({ length: EMAIL_OTP_LENGTH }, (_, index) => code[index] ?? '')
    const nextToken = nextDigits.join('')
    setDigits(nextDigits)
    setError('')
    setNotice('')

    if (nextToken.length === EMAIL_OTP_LENGTH && !nextDigits.includes('')) {
      focusInput(EMAIL_OTP_LENGTH - 1)
      void submitToken(nextToken)
      return
    }

    focusInput(Math.min(code.length, EMAIL_OTP_LENGTH - 1))
  }

  function setDigit(index: number, value: string): void {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length > 1) {
      applyCode(cleaned)
      return
    }

    const nextDigit = cleaned.slice(-1)
    let nextToken = ''
    setDigits((current) => {
      const nextDigits = current.map((item, itemIndex) => (itemIndex === index ? nextDigit : item))
      nextToken = nextDigits.join('')
      return nextDigits
    })
    setError('')
    setNotice('')

    if (nextDigit) {
      focusInput(Math.min(index + 1, EMAIL_OTP_LENGTH - 1))
    }

    if (nextToken.length === EMAIL_OTP_LENGTH && !nextToken.includes('')) {
      void submitToken(nextToken)
    }
  }

  function handleKeyDown(index: number, key: string): void {
    if (key !== 'Backspace' || digits[index]) return
    focusInput(Math.max(index - 1, 0))
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    event.preventDefault()
    applyCode(event.clipboardData.getData('text'))
  }

  async function handlePasteFromClipboard(): Promise<void> {
    setError('')
    setNotice('')

    if (!navigator.clipboard?.readText) {
      setError('Paste the code manually.')
      setErrorKey((current) => current + 1)
      return
    }

    try {
      const pasted = (await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, EMAIL_OTP_LENGTH)
      if (!pasted) {
        setError(`Copy the ${EMAIL_OTP_LENGTH}-digit code first.`)
        setErrorKey((current) => current + 1)
        return
      }

      applyCode(pasted)
    } catch {
      setError('Paste the code manually.')
      setErrorKey((current) => current + 1)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    await submitToken()
  }

  async function handleResend(): Promise<void> {
    setError('')
    setNotice('')
    clearDigits()
    lastSubmittedTokenRef.current = ''
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
    otpLength: EMAIL_OTP_LENGTH,
    handleKeyDown,
    handlePaste,
    handlePasteFromClipboard,
    handleResend,
    handleSubmit,
    loading,
    notice,
    resending,
    setDigit,
    setEmail,
  }
}
