import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import AuthShell from '../components/auth/AuthShell'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.localStorage.setItem('tailordeck-auth-preview', 'signed-in')
    navigate('/dashboard')
  }

  return (
    <AuthShell title="TailorDeck" subtitle="Your shop, in your pocket">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="signin-email" className="auth-label">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
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
              required
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

        <button type="submit" className="btn btn-primary btn-full auth-submit">
          Sign In
        </button>

        <button type="button" className="btn btn-secondary btn-full auth-google-btn">
          <FcGoogle size={16} />
          Sign in with Google
        </button>

        <button type="button" className="auth-link-btn">
          Forgot password?
        </button>
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
