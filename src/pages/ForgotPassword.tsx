import { Link } from 'react-router-dom'
import { useState } from 'react'
import AuthShell from '../components/auth/AuthShell'
import { sendPasswordReset } from '../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')
    setLoading(true)
    try {
      await sendPasswordReset(email)
      setMessage('Password reset link sent. Check your email.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="TailorDeck" subtitle="Reset your password">
      <form className="auth-form auth-form-signin" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="forgot-email" className="auth-label">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {message ? <p className="auth-feedback success" role="status">{message}</p> : null}
        {errorMessage ? <p className="auth-feedback error" role="alert">{errorMessage}</p> : null}
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
