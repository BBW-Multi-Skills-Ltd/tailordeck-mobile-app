import { Link } from 'react-router-dom'
import { Clipboard } from 'lucide-react'
import AuthShell from '../components/auth/AuthShell'
import { useVerifyEmailForm } from '../components/auth/useVerifyEmailForm'

export default function VerifyEmail() {
  const form = useVerifyEmailForm()

  return (
    <AuthShell title="Verify Email" subtitle={`Enter the ${form.otpLength}-digit code sent to your email`}>
      <form className="auth-form" onSubmit={form.handleSubmit}>
        <div className="input-group">
          <label htmlFor="verify-email" className="auth-label">Email Address</label>
          <input
            id="verify-email"
            className={`auth-input${form.error && !form.email ? ' input-invalid input-shake' : ''}`}
            type="email"
            inputMode="email"
            value={form.email}
            placeholder="Enter your email"
            onChange={(event) => form.setEmail(event.target.value)}
          />
        </div>

        <div className="input-group">
          <div className="auth-otp-label-row">
            <span className="auth-label">Verification Code</span>
            <button type="button" className="auth-otp-copy" onClick={form.handlePasteFromClipboard}>
              <Clipboard size={13} />
              Paste code
            </button>
          </div>
          <div className="auth-otp-row" aria-label={`${form.otpLength} digit verification code`}>
            {form.digits.map((digit, index) => (
              <input
                key={`otp-${index}-${form.errorKey}`}
                data-otp-index={index}
                className={`auth-otp-input${form.error ? ' input-invalid input-shake' : ''}`}
                value={digit}
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                aria-label={`Digit ${index + 1}`}
                onChange={(event) => form.setDigit(index, event.target.value)}
                onKeyDown={(event) => form.handleKeyDown(index, event.key)}
                onPaste={form.handlePaste}
              />
            ))}
          </div>
          {form.error ? <span className="input-error-text">{form.error}</span> : null}
          {form.notice ? <span className="auth-inline-success">{form.notice}</span> : null}
        </div>

        <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={form.loading}>
          {form.loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <button type="button" className="btn btn-secondary btn-full auth-google-btn" disabled={form.resending} onClick={form.handleResend}>
          {form.resending ? 'Sending...' : 'Resend Code'}
        </button>
      </form>

      <p className="auth-switch-line">
        Wrong email?{' '}
        <Link to="/auth/signup" className="auth-switch-link">
          Create account again
        </Link>
      </p>
    </AuthShell>
  )
}
