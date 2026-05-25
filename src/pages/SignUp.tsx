import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import AuthShell from '../components/auth/AuthShell'
import { TAILOR_SIGNUP_PREFILL_KEY } from '../lib/settings'
import { markOnboardingStage, registerLocalAccount, setPreviewAuthenticated } from '../lib/auth'

export default function SignUp() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const strength = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }, [password])

  const passwordLabel = strength <= 1 ? 'Weak password' : strength <= 3 ? 'Medium password' : 'Strong password'

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      window.alert('Enter at least email and password to create account.')
      return
    }
    const normalizedEmail = email.trim().toLowerCase()
    registerLocalAccount({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: `+234${phone.replace(/\D/g, '')}`,
      password,
    })
    window.localStorage.setItem(
      TAILOR_SIGNUP_PREFILL_KEY,
      JSON.stringify({
        fullName: fullName.trim(),
        email: normalizedEmail,
        shopName: '',
      }),
    )
    setPreviewAuthenticated('signed-up')
    markOnboardingStage('setup')
    window.alert('Account created. Continue with setup.')
    navigate('/onboarding/setup')
  }

  return (
    <AuthShell title="TailorDeck" subtitle="Create your account to get started">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="signup-name" className="auth-label">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            className="auth-input"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="signup-email" className="auth-label">
            Email Address
          </label>
          <input
            id="signup-email"
            type="text"
            className="auth-input"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="signup-phone" className="auth-label">
            Phone Number
          </label>
          <div className="auth-phone-row">
            <span className="auth-phone-prefix">+234</span>
            <input
              id="signup-phone"
              type="tel"
              inputMode="numeric"
              className="auth-input"
              placeholder="80 1234 5678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="signup-password" className="auth-label">
            Password
          </label>
          <div className="auth-password-wrap">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="auth-eye-btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="auth-strength">
            <div className={`auth-strength-bar${strength >= 1 ? ' fill' : ''}`} />
            <div className={`auth-strength-bar${strength >= 2 ? ' fill' : ''}`} />
            <div className={`auth-strength-bar${strength >= 3 ? ' fill' : ''}`} />
            <div className={`auth-strength-bar${strength >= 4 ? ' fill' : ''}`} />
          </div>
          <p className={`auth-strength-text${strength >= 2 ? ' medium' : ''}${strength >= 4 ? ' strong' : ''}`}>{passwordLabel}</p>
        </div>

        <div className="input-group">
          <label htmlFor="signup-confirm" className="auth-label">
            Confirm Password
          </label>
          <input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            className="auth-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <label className="auth-agree">
          <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
          <span>
            I agree to the <button type="button">Terms of Service</button> and <button type="button">Privacy Policy</button>
          </span>
        </label>

        <button type="submit" className="btn btn-primary btn-full auth-submit">
          Create Account
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button type="button" className="btn btn-secondary btn-full auth-google-btn">
          <FcGoogle size={16} />
          Sign up with Google
        </button>
      </form>

      <p className="auth-switch-line">
        Already have an account?{' '}
        <Link to="/auth/signin" className="auth-switch-link">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
