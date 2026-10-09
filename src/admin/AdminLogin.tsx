import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react'
import { passwordChecks, passwordStrength } from '../lib/formValidation'
import { supabase } from '../lib/supabase'
import { sendPasswordReset, updateLoginPassword, verifyPasswordResetCode } from '../services/authService'
import { EMAIL_OTP_LENGTH } from '../validation/authSchemas'
import { friendlyAuthError } from '../lib/authErrors'

type Mode = 'sign-in' | 'request-code' | 'set-password'

/**
 * Admin sign-in (email + password), plus first-time/forgot password with an emailed code.
 * `onHold(true)` keeps this screen visible while a code-based reset is in progress (verifying the code
 * signs the user in before the new password is saved).
 */
export default function AdminLogin({ onHold }: { onHold: (hold: boolean) => void }) {
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeVerified, setCodeVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const checks = passwordChecks(password)
  const normalizedEmail = email.trim().toLowerCase()

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmPassword('')
  }

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
      // Same message for unknown email and wrong password, so the form does not reveal which accounts exist.
      if (signInError) throw new Error('Email or password is incorrect.')
    } catch (caught) {
      setError(friendlyAuthError(caught, 'Unable to sign in.'))
    } finally {
      setBusy(false)
    }
  }

  async function requestCode(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await sendPasswordReset(normalizedEmail)
      switchMode('set-password')
      setNotice(`If this is an admin email, a ${EMAIL_OTP_LENGTH}-digit code is on its way to ${normalizedEmail}.`)
    } catch (caught) {
      setError(friendlyAuthError(caught, 'Unable to send a code.'))
    } finally {
      setBusy(false)
    }
  }

  async function setNewPassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (passwordStrength(password) < checks.length) {
      setError('Use a password that meets every requirement below.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    onHold(true)
    try {
      if (!codeVerified) {
        await verifyPasswordResetCode({ email: normalizedEmail, token: code.trim() })
        setCodeVerified(true)
      }
      await updateLoginPassword({ password, confirmPassword })
      onHold(false)
    } catch (caught) {
      setError(friendlyAuthError(caught, 'Unable to set the password.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ad-auth">
      <div className="ad-auth-card mk-clay">
        <span className="ad-auth-icon">
          <LockKeyhole size={22} />
        </span>
        <h1>TailorDeck Admin</h1>
        <p className="ad-muted">Authorised team members only.</p>

        {mode === 'sign-in' ? (
          <form onSubmit={signIn} className="ad-form">
            <label className="ad-field">
              <span>Email</span>
              <span className="ad-input-wrap">
                <Mail size={16} />
                <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </span>
            </label>
            <PasswordField label="Password" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} autoComplete="current-password" />
            {error ? <p className="ad-error" role="alert">{error}</p> : null}
            <button type="submit" className="mk-btn mk-btn-primary ad-full" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
            <button type="button" className="ad-link-btn" onClick={() => switchMode('request-code')}>
              First time or forgot password?
            </button>
          </form>
        ) : null}

        {mode === 'request-code' ? (
          <form onSubmit={requestCode} className="ad-form">
            <p className="ad-muted">Enter your admin email. We will send a code to set a new password.</p>
            <label className="ad-field">
              <span>Admin email</span>
              <span className="ad-input-wrap">
                <Mail size={16} />
                <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </span>
            </label>
            {error ? <p className="ad-error" role="alert">{error}</p> : null}
            <button type="submit" className="mk-btn mk-btn-primary ad-full" disabled={busy}>
              {busy ? 'Sending...' : 'Send code'}
            </button>
            <button type="button" className="ad-link-btn" onClick={() => switchMode('sign-in')}>
              Back to sign in
            </button>
          </form>
        ) : null}

        {mode === 'set-password' ? (
          <form onSubmit={setNewPassword} className="ad-form">
            {notice ? <p className="ad-notice" role="status">{notice}</p> : null}
            {codeVerified ? null : (
              <label className="ad-field">
                <span>Code from the email</span>
                <span className="ad-input-wrap">
                  <KeyRound size={16} />
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={EMAIL_OTP_LENGTH}
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, EMAIL_OTP_LENGTH))}
                  />
                </span>
              </label>
            )}
            <PasswordField label="New password" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} autoComplete="new-password" />
            <ul className="ad-checks">
              {checks.map((check) => (
                <li key={check.key} className={check.passed ? 'passed' : ''}>
                  {check.label}
                </li>
              ))}
            </ul>
            <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} autoComplete="new-password" />
            {error ? <p className="ad-error" role="alert">{error}</p> : null}
            <button type="submit" className="mk-btn mk-btn-primary ad-full" disabled={busy}>
              {busy ? 'Saving...' : 'Set password and sign in'}
            </button>
            <button
              type="button"
              className="ad-link-btn"
              onClick={() => {
                onHold(false)
                void supabase.auth.signOut()
                setCodeVerified(false)
                setCode('')
                switchMode('sign-in')
              }}
            >
              Cancel
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}

function PasswordField({
  autoComplete,
  label,
  onChange,
  onToggle,
  show,
  value,
}: {
  autoComplete: string
  label: string
  onChange: (value: string) => void
  onToggle: () => void
  show: boolean
  value: string
}) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      <span className="ad-input-wrap">
        <LockKeyhole size={16} />
        <input type={show ? 'text' : 'password'} autoComplete={autoComplete} required value={value} onChange={(event) => onChange(event.target.value)} />
        <button type="button" className="ad-eye" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  )
}
