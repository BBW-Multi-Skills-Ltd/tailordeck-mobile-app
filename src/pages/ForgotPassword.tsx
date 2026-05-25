import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'

export default function ForgotPassword() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.alert('Reset link placeholder sent. Supabase auth email flow will be wired next.')
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
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full auth-submit">
          Send Reset Link
        </button>
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
