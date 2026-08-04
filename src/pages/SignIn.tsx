import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import AuthShell from '../components/auth/AuthShell'
import { useSignInForm } from '../components/auth/useSignInForm'

export default function SignIn() {
  const form = useSignInForm()

  return (
    <AuthShell
      title="TailorDeck"
      subtitle="Your shop, in your pocket"
      pageClassName="auth-page-signin"
      wrapClassName="auth-wrap-signin"
    >
      <form className="auth-form auth-form-signin" onSubmit={form.handleSubmit}>
        <div className="input-group">
          <label htmlFor="signin-email" className="auth-label">
            Email
          </label>
          <input
            key={`signin-email-${form.errorKey}`}
            id="signin-email"
            aria-describedby={form.errors.email ? 'signin-email-error' : undefined}
            aria-invalid={Boolean(form.errors.email)}
            type="email"
            inputMode="email"
            className={`auth-input${form.errors.email ? ' input-invalid input-shake' : ''}`}
            placeholder="Enter your email"
            value={form.email}
            onChange={(event) => form.setEmail(event.target.value)}
          />
          {form.errors.email ? <span id="signin-email-error" className="input-error-text">{form.errors.email}</span> : null}
        </div>

        <div className="input-group">
          <label htmlFor="signin-password" className="auth-label">
            Password
          </label>
          <div className="auth-password-wrap">
            <input
              key={`signin-password-${form.errorKey}`}
              id="signin-password"
              aria-describedby={form.errors.password ? 'signin-password-error' : undefined}
              aria-invalid={Boolean(form.errors.password)}
              type={form.showPassword ? 'text' : 'password'}
              className={`auth-input auth-input-password${form.errors.password ? ' input-invalid input-shake' : ''}`}
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => form.setPassword(event.target.value)}
            />
            <button
              type="button"
              className="auth-eye-btn"
              aria-label={form.showPassword ? 'Hide password' : 'Show password'}
              onClick={() => form.setShowPassword((value) => !value)}
            >
              {form.showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {form.errors.password ? <span id="signin-password-error" className="input-error-text">{form.errors.password}</span> : null}
        </div>

        <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={form.loading}>
          {form.loading ? 'Signing in...' : 'Sign In'}
        </button>

        {form.errors.form ? <p className="auth-feedback error" role="alert">{form.errors.form}</p> : null}

        <button type="button" className="btn btn-secondary btn-full auth-google-btn" onClick={form.handleGoogleSignIn}>
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
      <p className="auth-legal-line">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <span aria-hidden>·</span>
        <Link to="/terms-of-service">Terms of Service</Link>
      </p>
    </AuthShell>
  )
}
