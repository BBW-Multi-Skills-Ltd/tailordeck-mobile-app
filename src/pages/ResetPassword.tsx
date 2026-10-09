import { Check, Eye, EyeOff } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import { PasswordChecklist, PasswordStrength } from '../components/auth/PasswordStrength'
import { passwordChecks, passwordStrength } from '../lib/formValidation'
import { scrollFirstFormErrorIntoView } from '../lib/scroll'
import { supabase } from '../lib/supabase'
import { sendPasswordReset, updateLoginPassword, verifyPasswordResetCode } from '../services/authService'
import { EMAIL_OTP_LENGTH } from '../validation/authSchemas'
import { friendlyAuthError } from '../lib/authErrors'

type ResetPasswordErrors = {
  form?: string
  code?: string
  password?: string
  confirmPassword?: string
}

type ConfirmPasswordState = 'idle' | 'partial' | 'match' | 'mismatch'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Code mode (normal flow): reached from "Forgot password" with ?email=; the user types the emailed code.
  // Link mode: an older reset email link that already signed the user into a recovery session.
  const codeEmail = searchParams.get('email')?.trim().toLowerCase() || ''
  const codeMode = Boolean(codeEmail)
  const [code, setCode] = useState('')
  const [codeVerified, setCodeVerified] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [initialUrlError] = useState(getResetUrlError)
  const [checkingSession, setCheckingSession] = useState(!initialUrlError && !codeMode)
  const [recoveryReady, setRecoveryReady] = useState(codeMode)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<ResetPasswordErrors>(() => initialUrlError ? { form: initialUrlError } : {})
  const [errorKey, setErrorKey] = useState(0)

  const strength = useMemo(() => passwordStrength(password), [password])
  const checks = useMemo(() => passwordChecks(password), [password])
  const confirmState = getConfirmPasswordState(password, confirmPassword)
  const passwordLabel = strength <= 1 ? 'Weak password' : strength <= 3 ? 'Medium password' : 'Strong password'

  useEffect(() => {
    let active = true
    if (initialUrlError || codeMode) {
      return undefined
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setRecoveryReady(true)
        setCheckingSession(false)
        setErrors({})
      }
    })

    const timer = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data }) => {
        if (!active) return
        setRecoveryReady(Boolean(data.session))
        setCheckingSession(false)
        if (!data.session) {
          setErrors({ form: 'Open the latest password reset link from your email.' })
        }
      })
    }, 700)

    return () => {
      active = false
      window.clearTimeout(timer)
      subscription.subscription.unsubscribe()
    }
  }, [codeMode, initialUrlError])

  function validate(): boolean {
    const nextErrors: ResetPasswordErrors = {}
    if (codeMode && !codeVerified && !new RegExp(`^\\d{${EMAIL_OTP_LENGTH}}$`).test(code.trim())) {
      nextErrors.code = `Enter the ${EMAIL_OTP_LENGTH}-digit code from your email.`
    }
    if (!password) nextErrors.password = 'Fill this input.'
    else if (strength < 4) nextErrors.password = 'Use all password requirements.'
    if (!confirmPassword) nextErrors.confirmPassword = 'Fill this input.'
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.'

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      setErrorKey((value) => value + 1)
      scrollFirstFormErrorIntoView('.auth-form')
      return false
    }
    return true
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!recoveryReady || !validate()) return

    setLoading(true)
    setErrors({})
    try {
      // A code works once; if saving the password failed after it was accepted, retry without re-verifying.
      if (codeMode && !codeVerified) {
        await verifyPasswordResetCode({ email: codeEmail, token: code.trim() })
        setCodeVerified(true)
      }
      await updateLoginPassword({ password, confirmPassword })
      setSaved(true)
      window.setTimeout(() => {
        void supabase.auth.signOut().finally(() => navigate('/auth/signin', { replace: true }))
      }, 1000)
    } catch (error) {
      setErrors({ form: friendlyAuthError(error, 'Unable to reset password.') })
      setErrorKey((value) => value + 1)
    } finally {
      setLoading(false)
    }
  }

  async function resendCode() {
    setResendState('sending')
    setErrors({})
    try {
      await sendPasswordReset(codeEmail)
      setResendState('sent')
    } catch (error) {
      setResendState('idle')
      setErrors({ form: friendlyAuthError(error, 'Unable to send a new code.') })
    }
  }

  return (
    <AuthShell title="TailorDeck" subtitle="Create a new password">
      <form className="auth-form auth-form-signin" onSubmit={handleSubmit}>
        {checkingSession ? (
          <p className="auth-feedback success" role="status">Checking reset link...</p>
        ) : null}

        {codeMode ? (
          <div className="input-group">
            <p className="auth-feedback success" role="status">
              We sent a {EMAIL_OTP_LENGTH}-digit code to {codeEmail}. Enter it below with your new password.
            </p>
            <label htmlFor="reset-code" className="auth-label">Reset code</label>
            <input
              key={`reset-code-${errorKey}`}
              id="reset-code"
              aria-describedby={errors.code ? 'reset-code-error' : undefined}
              aria-invalid={Boolean(errors.code)}
              autoComplete="one-time-code"
              className={`auth-input${errors.code ? ' input-invalid input-shake' : ''}`}
              inputMode="numeric"
              maxLength={EMAIL_OTP_LENGTH}
              placeholder={`${EMAIL_OTP_LENGTH}-digit code`}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, EMAIL_OTP_LENGTH))}
            />
            {errors.code ? <span id="reset-code-error" className="input-error-text">{errors.code}</span> : null}
            <button type="button" className="auth-link-btn" disabled={resendState === 'sending'} onClick={() => void resendCode()}>
              {resendState === 'sending' ? 'Sending...' : resendState === 'sent' ? 'New code sent' : 'Resend code'}
            </button>
          </div>
        ) : null}

        <PasswordInput
          error={errors.password}
          errorKey={errorKey}
          id="reset-password"
          label="New Password"
          placeholder="Create a strong password"
          showPassword={showPassword}
          value={password}
          onChange={setPassword}
          onTogglePassword={() => setShowPassword((value) => !value)}
        />
        <PasswordStrength strength={strength} label={passwordLabel} />
        <PasswordChecklist checks={checks} />

        <PasswordInput
          error={errors.confirmPassword}
          errorKey={errorKey}
          id="reset-confirm-password"
          label="Confirm Password"
          matchState={confirmState}
          placeholder="Confirm your password"
          showPassword={showPassword}
          value={confirmPassword}
          onChange={setConfirmPassword}
          onTogglePassword={() => setShowPassword((value) => !value)}
        />
        {!errors.confirmPassword && confirmState !== 'idle' ? (
          <span className={`password-match-hint ${confirmState}`}>{getConfirmPasswordHelper(confirmState)}</span>
        ) : null}

        <button type="submit" className={`btn btn-primary btn-full auth-submit${saved ? ' profile-settings-action-saved' : ''}`} disabled={!recoveryReady || loading || saved}>
          {loading ? 'Updating...' : saved ? (
            <>
              <Check size={15} />
              Password Updated
            </>
          ) : 'Update Password'}
        </button>

        {errors.form ? <p className="auth-feedback error" role="alert">{errors.form}</p> : null}
      </form>

      <p className="auth-switch-line">
        Back to{' '}
        <Link to="/auth/signin" className="auth-switch-link">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}

function getResetUrlError(): string {
  if (typeof window === 'undefined') return ''
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const queryParams = new URLSearchParams(window.location.search)
  return hashParams.get('error_description') || queryParams.get('error_description') || ''
}

function PasswordInput({
  error,
  errorKey,
  id,
  label,
  matchState = 'idle',
  onChange,
  onTogglePassword,
  placeholder,
  showPassword,
  value,
}: {
  error?: string
  errorKey: number
  id: string
  label: string
  matchState?: ConfirmPasswordState
  onChange: (value: string) => void
  onTogglePassword: () => void
  placeholder: string
  showPassword: boolean
  value: string
}) {
  const invalid = Boolean(error) || matchState === 'mismatch'
  const stateClass = matchState === 'match' ? ' input-match' : matchState === 'partial' ? ' input-partial' : invalid ? ' input-invalid input-shake' : ''

  return (
    <div className="input-group">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-password-wrap">
        <input
          key={`${id}-${errorKey}`}
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={invalid}
          type={showPassword ? 'text' : 'password'}
          className={`auth-input auth-input-password${stateClass}`}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="auth-eye-btn" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={onTogglePassword}>
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error ? <span id={`${id}-error`} className="input-error-text">{error}</span> : null}
    </div>
  )
}

function getConfirmPasswordState(password: string, confirmPassword: string): ConfirmPasswordState {
  if (!password || !confirmPassword) return 'idle'
  if (confirmPassword === password) return 'match'
  if (password.startsWith(confirmPassword)) return 'partial'
  return 'mismatch'
}

function getConfirmPasswordHelper(matchState: ConfirmPasswordState): string {
  if (matchState === 'partial') return 'Keep typing, it matches so far.'
  if (matchState === 'match') return 'Passwords match.'
  if (matchState === 'mismatch') return 'Passwords do not match.'
  return ''
}
