import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { resendSignUpEmailOtp, verifySignUpEmailOtp } from '../../services/authService'
import { EMAIL_OTP_LENGTH } from '../../validation/authSchemas'
import {
  MAX_RESENDS_BEFORE_PAUSE,
  NOTICE_TIMEOUT_MS,
  OTP_EXPIRY_SECONDS,
  REJECTED_CODE_CLEAR_MS,
  RESEND_COOLDOWN_SECONDS,
  RESEND_PAUSE_SECONDS,
} from './verifyEmailConstants'
import {
  loadPendingVerification,
  persistPendingVerification,
  type PendingVerification,
} from './verifyEmailStorage'
import { formatSeconds, getFriendlyOtpError } from './verifyEmailUtils'
import { useOtpDigits } from './useOtpDigits'
import { completeVerifiedEmail } from './verifyEmailCompletion'

export function useVerifyEmailForm() {
  const navigate = useNavigate()
  const pending = useMemo(() => loadPendingVerification(), [])
  const [email, setEmail] = useState(pending.email)
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

  const expiryAt = codeSentAt + OTP_EXPIRY_SECONDS * 1000
  const resendAvailableAt = Math.max(codeSentAt + RESEND_COOLDOWN_SECONDS * 1000, resendLockedUntil)
  const secondsUntilExpiry = Math.max(0, Math.ceil((expiryAt - now) / 1000))
  const secondsUntilResend = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000))

  const otp = useOtpDigits({
    length: EMAIL_OTP_LENGTH,
    onComplete: (nextToken) => void submitToken(nextToken),
    onInputChange: clearFeedback,
  })

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

  function clearFeedback(): void {
    setError('')
    setNotice('')
  }

  function showError(message: string): void {
    setError(message)
    setErrorKey((current) => current + 1)
  }

  function scheduleRejectedCodeClear(): void {
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current)
    clearTimerRef.current = window.setTimeout(() => {
      otp.clearDigits()
      otp.resetLastSubmittedToken()
    }, REJECTED_CODE_CLEAR_MS)
  }

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

  function validate(nextToken = otp.token): boolean {
    if (!email.trim()) {
      showError('Enter your email address.')
      return false
    }
    if (!new RegExp(`^\\d{${EMAIL_OTP_LENGTH}}$`).test(nextToken)) {
      showError(`Enter the ${EMAIL_OTP_LENGTH}-digit code.`)
      return false
    }
    return true
  }

  async function submitToken(nextToken = otp.token): Promise<void> {
    setNotice('')
    if (loading) return
    if (!validate(nextToken)) {
      otp.resetLastSubmittedToken()
      return
    }
    if (!otp.canSubmitToken(nextToken)) return

    setLoading(true)
    try {
      await verifySignUpEmailOtp({ email, token: nextToken })
    } catch (verifyError) {
      otp.resetLastSubmittedToken()
      showError(getFriendlyOtpError(verifyError, secondsUntilExpiry))
      scheduleRejectedCodeClear()
      setLoading(false)
      return
    }

    try {
      await completeVerifiedEmail({ email, navigate, pending })
    } catch (activationError) {
      console.error('Email verified, but profile activation failed:', activationError)
      showError('Email verified. Please sign in to finish setup.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasteFromClipboard(): Promise<void> {
    clearFeedback()

    if (!navigator.clipboard?.readText) {
      showError('Paste the code manually.')
      return
    }

    try {
      const pasted = (await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, EMAIL_OTP_LENGTH)
      if (!pasted) {
        showError(`Copy the ${EMAIL_OTP_LENGTH}-digit code first.`)
        return
      }
      otp.applyCode(pasted)
    } catch {
      showError('Paste the code manually.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    await submitToken()
  }

  async function handleResend(): Promise<void> {
    clearFeedback()
    otp.clearDigits()
    otp.resetLastSubmittedToken()

    if (!email.trim()) {
      showError('Enter your email address.')
      return
    }
    if (secondsUntilResend > 0) {
      showError(`Please wait ${formatSeconds(secondsUntilResend)} before requesting another code.`)
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
      showError(getFriendlyOtpError(resendError, secondsUntilExpiry))
    } finally {
      setResending(false)
    }
  }

  return {
    digits: otp.digits,
    email,
    error,
    errorKey,
    expiryLabel: formatSeconds(secondsUntilExpiry),
    handleKeyDown: otp.handleKeyDown,
    handlePaste: otp.handlePaste,
    handlePasteFromClipboard,
    handleResend,
    handleSubmit,
    loading,
    notice,
    otpLength: EMAIL_OTP_LENGTH,
    resendLabel: secondsUntilResend > 0 ? `You can resend in ${formatSeconds(secondsUntilResend)}` : 'Resend Code',
    resending,
    setDigit: otp.setDigit,
    setEmail,
  }
}
