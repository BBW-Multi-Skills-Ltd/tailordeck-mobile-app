import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import { SignUpForm } from '../components/auth/SignUpForm'
import { useSignUpForm } from '../components/auth/useSignUpForm'

export default function SignUp() {
  const form = useSignUpForm()

  return (
    <AuthShell title="TailorDeck" subtitle="Create your account to get started">
      <SignUpForm {...form} />
      <p className="auth-switch-line">
        Already have an account?{' '}
        <Link to="/auth/signin" className="auth-switch-link">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
