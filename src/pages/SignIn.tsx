import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import AuthShell from '../components/auth/AuthShell'
import { signInWithEmail, signInWithGoogle } from '../services/authService'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      await signInWithEmail({ email, password })
      navigate('/')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="TailorDeck"
      subtitle="Your shop, in your pocket"
      pageClassName="auth-page-signin"
      wrapClassName="auth-wrap-signin"
    >
      <form className="auth-form auth-form-signin" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="signin-email" className="auth-label">
            Email
          </label>
          <input
            id="signin-email"
            type="text"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="signin-password" className="auth-label">
            Password
          </label>
          <div className="auth-password-wrap">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input-password"
              placeholder="Enter your password"
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
        </div>

        <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <button type="button" className="btn btn-secondary btn-full auth-google-btn" onClick={() => void signInWithGoogle()}>
          <FcGoogle size={16} />
          Sign in with Google
        </button>

        <Link to="/auth/forgot" className="auth-link-btn">
          Forgot password?
        </Link>
      </form>

      <p className="auth-switch-line">
        Don&apos;t have an account?{' '}
        <Link to="/auth/signup" className="auth-switch-link">
          Sign up
        </Link>
      </p>
    </AuthShell>
  )
}
