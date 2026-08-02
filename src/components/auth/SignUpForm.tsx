import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { AuthTextField } from './AuthTextField'
import { PasswordChecklist, PasswordStrength } from './PasswordStrength'
import type { useSignUpForm } from './useSignUpForm'

type SignUpFormProps = ReturnType<typeof useSignUpForm>

export function SignUpForm(props: SignUpFormProps) {
  return (
    <form className="auth-form" onSubmit={props.handleSubmit}>
      <AuthTextField error={props.errors.fullName} errorKey={props.errorKey} id="signup-name" label="Full Name" placeholder="Enter your full name" value={props.fullName} onChange={props.setFullName} />
      <AuthTextField error={props.errors.email} errorKey={props.errorKey} id="signup-email" inputMode="email" label="Email Address" placeholder="Enter your email address" value={props.email} onChange={props.setEmail} />

      <div className="input-group">
        <label htmlFor="signup-phone" className="auth-label">Phone Number</label>
        <div className={`auth-phone-row${props.errors.phone ? ' input-invalid-wrap' : ''}`}>
          <span className="auth-phone-prefix">+234</span>
          <input
            key={`signup-phone-${props.errorKey}`}
            id="signup-phone"
            aria-describedby={props.errors.phone ? 'signup-phone-error' : undefined}
            aria-invalid={Boolean(props.errors.phone)}
            type="tel"
            inputMode="numeric"
            className={`auth-input${props.errors.phone ? ' input-invalid input-shake' : ''}`}
            placeholder="Your phone number"
            value={props.phone}
            onChange={(event) => props.setPhone(event.target.value)}
          />
        </div>
        {props.errors.phone ? <span id="signup-phone-error" className="input-error-text">{props.errors.phone}</span> : null}
      </div>

      <div className="input-group">
        <label htmlFor="signup-password" className="auth-label">Password</label>
        <div className="auth-password-wrap">
          <input
            key={`signup-password-${props.errorKey}`}
            id="signup-password"
            aria-describedby={props.errors.password ? 'signup-password-error' : undefined}
            aria-invalid={Boolean(props.errors.password)}
            type={props.showPassword ? 'text' : 'password'}
            className={`auth-input auth-input-password${props.errors.password ? ' input-invalid input-shake' : ''}`}
            placeholder="Create a strong password"
            value={props.password}
            onChange={(event) => props.setPassword(event.target.value)}
          />
          <button type="button" className="auth-eye-btn" aria-label={props.showPassword ? 'Hide password' : 'Show password'} onClick={() => props.setShowPassword((value) => !value)}>
            {props.showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <PasswordStrength strength={props.strength} label={props.passwordLabel} />
        <PasswordChecklist checks={props.checks} />
        {props.errors.password ? <span id="signup-password-error" className="input-error-text">{props.errors.password}</span> : null}
      </div>

      <AuthTextField
        error={props.errors.confirmPassword}
        errorKey={props.errorKey}
        id="signup-confirm"
        label="Confirm Password"
        matchState={props.confirmState}
        type={props.showPassword ? 'text' : 'password'}
        placeholder="Confirm your password"
        value={props.confirmPassword}
        onChange={props.setConfirmPassword}
        helper={getConfirmPasswordHelper(props.confirmState)}
      />

      <label className={`auth-agree${props.errors.agree ? ' auth-agree-error input-shake' : ''}`}>
        <input type="checkbox" checked={props.agree} onChange={(event) => props.setAgree(event.target.checked)} />
        <span>
          I agree to the <button type="button">Terms of Service</button> and <button type="button">Privacy Policy</button>
        </span>
      </label>
      {props.errors.agree ? <span className="input-error-text">{props.errors.agree}</span> : null}

      <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={props.loading}>
        {props.loading ? 'Getting things ready...' : 'Create Account'}
      </button>
      {props.errors.form ? <p className="auth-feedback error" role="alert">{props.errors.form}</p> : null}
      <div className="auth-divider"><span>or</span></div>
      <button type="button" className="btn btn-secondary btn-full auth-google-btn" onClick={props.handleGoogleSignUp}><FcGoogle size={16} />Sign up with Google</button>
    </form>
  )
}

function getConfirmPasswordHelper(matchState: 'idle' | 'partial' | 'match' | 'mismatch'): string {
  if (matchState === 'partial') return 'Keep typing, it matches so far.'
  if (matchState === 'match') return 'Passwords match.'
  if (matchState === 'mismatch') return 'Passwords do not match.'
  return ''
}
