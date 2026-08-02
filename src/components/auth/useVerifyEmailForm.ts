import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { markOnboardingStage } from '../../lib/auth'
import { loadTailorSettings, TAILOR_PENDING_EMAIL_VERIFICATION_KEY } from '../../lib/settings'
import { resendSignUpEmailOtp, verifySignUpEmailOtp } from '../../services/authService'
import { syncPendingOnboardingSettings } from '../../services/onboardingService'
import { activateVerifiedProfile } from '../../services/profileService'
import { EMAIL_OTP_LENGTH } from '../../validation/authSchemas'

type PendingVerification = {
  codeSentAt: number
  email: string
  fullName: string
  phone: string
  resendCount: number
  resendLockedUntil: number
  setupWasCompleted: boolean
}

const OTP_EXPIRY_SECONDS = 60 * 60
const RESEND_COOLDOWN_SECONDS = 60
const MAX_RESENDS_BEFORE_PAUSE = 3
const RESEND_PAUSE_SECONDS = 2 * 60
const NOTICE_TIMEOUT_MS = 3500
const REJECTED_CODE_CLEAR_MS = 1200

function loadPendingVerification(): PendingVerification {
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

function persistPendingVerification(next: PendingVerification): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TAILOR_PENDING_EMAIL_VERIFICATION_KEY, JSON.stringify(next))
}

function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getFriendlyOtpError(error: unknown, secondsUntilExpiry: number): string {
  const rawMessage = error instanceof Error ? error.message : ''
  const message = rawMessage.toLowerCase()

  if (message.includes('expired') || secondsUntilExpiry <= 0) {
    return 'This code has expired. Please request a new code.'
  }
  if (message.includes('invalid') || message.includes('token')) {
    return 'This code is incorrect. Please check it and try again.'
  }
  if (message.includes('rate') || message.includes('security')) {
    return 'Please wait before requesting another code.'
  }
  return rawMessage || 'Unable to verify this code.'
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
  const [codeSentAt, setCodeSentAt] = useState(pending.codeSentAt)
  const [resendCount, setResendCount] = useState(pending.resendCount)
  const [resendLockedUntil, setResendLockedUntil] = useState(pending.resendLockedUntil)
  const [now, setNow] = useState(() => Date.now())
  const clearTimerRef = useRef<number | null>(null)
  const noticeTimerRef = useRef<number | null>(null)
  const lastSubmittedTokenRef = useRef('')

  const token = digits.join('')
  const expiryAt = codeSentAt + OTP_EXPIRY_SECONDS * 1000
  const resendAvailableAt = Math.max(codeSentAt + RESEND_COOLDOWN_SECONDS * 1000, resendLockedUntil)
  const secondsUntilExpiry = Math.max(0, Math.ceil((expiryAt - now) / 1000))
  const secondsUntilResend = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000))

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current)
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    }
  }, [])

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
    }, REJECTED_CODE_CLEAR_MS)
  }, [clearDigits])

  function persistCurrentPending(next: Partial<PendingVerification>): void {
    persistPendingVerification({
      ...pending,
      codeSentAt,
      email: email.trim().toLowerCase(),
      resendCount,
      resendLockedUntil,
      ...next,
    })
  }

  function showNotice(message: string): void {
    setNotice(message)
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), NOTICE_TIMEOUT_MS)
  }

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
    } catch (verifyError) {
      lastSubmittedTokenRef.current = ''
      setError(getFriendlyOtpError(verifyError, secondsUntilExpiry))
      setErrorKey((current) => current + 1)
      scheduleRejectedCodeClear()
      setLoading(false)
      return
    }

    try {
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

      window.localStorage.removeItem(TAILOR_PENDING_EMAIL_VERIFICATION_KEY)
      markOnboardingStage(pending.setupWasCompleted ? 'plan' : 'setup')
      navigate(pending.setupWasCompleted ? '/onboarding/plan' : '/onboarding/setup', { replace: true })
    } catch (activationError) {
      console.error('Email verified, but profile activation failed:', activationError)
      setError('Email verified. Please sign in to finish setup.')
      setErrorKey((current) => current + 1)
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
    const nextDigits = digits.map((item, itemIndex) => (itemIndex === index ? nextDigit : item))
    const nextToken = nextDigits.join('')
    setDigits(nextDigits)
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

    if (secondsUntilResend > 0) {
      setError(`Please wait ${formatSeconds(secondsUntilResend)} before requesting another code.`)
      setErrorKey((current) => current + 1)
      return
    }

    setResending(true)
    try {
      await resendSignUpEmailOtp(email)
      const nextSentAt = Date.now()
      const nextCount = resendCount + 1
      const shouldPause = nextCount >= MAX_RESENDS_BEFORE_PAUSE
      const nextLockedUntil = shouldPause ? nextSentAt + RESEND_PAUSE_SECONDS * 1000 : 0
      const nextResendCount = shouldPause ? 0 : nextCount

      setCodeSentAt(nextSentAt)
      setResendCount(nextResendCount)
      setResendLockedUntil(nextLockedUntil)
      setNow(nextSentAt)
      persistCurrentPending({
        codeSentAt: nextSentAt,
        email: email.trim().toLowerCase(),
        resendCount: nextResendCount,
        resendLockedUntil: nextLockedUntil,
      })
      showNotice('A new code has been sent.')
    } catch (resendError) {
      setError(getFriendlyOtpError(resendError, secondsUntilExpiry))
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
    expiryLabel: formatSeconds(secondsUntilExpiry),
    handleKeyDown,
    handlePaste,
    handlePasteFromClipboard,
    handleResend,
    handleSubmit,
    loading,
    notice,
    otpLength: EMAIL_OTP_LENGTH,
    resendLabel: secondsUntilResend > 0 ? `You can resend in ${formatSeconds(secondsUntilResend)}` : 'Resend Code',
    resending,
    setDigit,
    setEmail,
  }
}
