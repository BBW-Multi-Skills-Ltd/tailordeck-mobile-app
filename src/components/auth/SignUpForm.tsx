import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import type { useSignUpForm } from './useSignUpForm'

type SignUpFormProps = ReturnType<typeof useSignUpForm>

export function SignUpForm(props: SignUpFormProps) {
  return (
    <form className="auth-form" onSubmit={props.handleSubmit}>
      <AuthTextField id="signup-name" label="Full Name" placeholder="Enter your full name" value={props.fullName} onChange={props.setFullName} />
      <AuthTextField id="signup-email" label="Email Address" placeholder="Enter your email address" value={props.email} onChange={props.setEmail} />

      <div className="input-group">
        <label htmlFor="signup-phone" className="auth-label">Phone Number</label>
        <div className="auth-phone-row">
          <span className="auth-phone-prefix">+234</span>
          <input id="signup-phone" type="tel" inputMode="numeric" className="auth-input" placeholder="80 1234 5678" value={props.phone} onChange={(event) => props.setPhone(event.target.value)} />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="signup-password" className="auth-label">Password</label>
        <div className="auth-password-wrap">
          <input id="signup-password" type={props.showPassword ? 'text' : 'password'} className="auth-input auth-input-password" placeholder="Create a strong password" value={props.password} onChange={(event) => props.setPassword(event.target.value)} />
          <button type="button" className="auth-eye-btn" aria-label={props.showPassword ? 'Hide password' : 'Show password'} onClick={() => props.setShowPassword((value) => !value)}>
            {props.showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <PasswordStrength strength={props.strength} label={props.passwordLabel} />
      </div>

      <AuthTextField id="signup-confirm" label="Confirm Password" type={props.showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={props.confirmPassword} onChange={props.setConfirmPassword} />

      <label className="auth-agree">
        <input type="checkbox" checked={props.agree} onChange={(event) => props.setAgree(event.target.checked)} />
        <span>
          I agree to the <button type="button">Terms of Service</button> and <button type="button">Privacy Policy</button>
        </span>
      </label>

      <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={props.loading}>
        {props.loading ? 'Creating account...' : 'Create Account'}
      </button>
      <div className="auth-divider"><span>or</span></div>
      <button type="button" className="btn btn-secondary btn-full auth-google-btn" onClick={props.handleGoogleSignUp}><FcGoogle size={16} />Sign up with Google</button>
    </form>
  )
}

function AuthTextField({ id, label, onChange, placeholder, type = 'text', value }: { id: string; label: string; onChange: (value: string) => void; placeholder: string; type?: string; value: string }) {
  return (
    <div className="input-group">
      <label htmlFor={id} className="auth-label">{label}</label>
      <input id={id} type={type} className="auth-input" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function PasswordStrength({ label, strength }: { label: string; strength: number }) {
  return (
    <>
      <div className="auth-strength">
        {[1, 2, 3, 4].map((level) => <div key={level} className={`auth-strength-bar${strength >= level ? ' fill' : ''}`} />)}
      </div>
      <p className={`auth-strength-text${strength >= 2 ? ' medium' : ''}${strength >= 4 ? ' strong' : ''}`}>{label}</p>
    </>
  )
}
