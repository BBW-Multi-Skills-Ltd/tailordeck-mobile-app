import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { type FieldErrors, isValidEmailFormat } from '../../lib/formValidation'
import { scrollFirstFormErrorIntoView } from '../../lib/scroll'
import { signInWithEmail, signInWithGoogle } from '../../services/authService'

type SignInFieldKey = 'email' | 'password' | 'form'

export function useSignInForm() {
  const navigate = useNavigate()
  const [email, setEmailValue] = useState('')
  const [password, setPasswordValue] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<SignInFieldKey>>({})
  const [errorKey, setErrorKey] = useState(0)

  function clearError(key: SignInFieldKey): void {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  function setEmail(value: string): void {
    setEmailValue(value)
    if (value.trim() && isValidEmailFormat(value)) clearError('email')
  }

  function setPassword(value: string): void {
    setPasswordValue(value)
    if (value) clearError('password')
  }

  function validate(): boolean {
    const nextErrors: FieldErrors<SignInFieldKey> = {}
    if (!email.trim()) nextErrors.email = 'Fill this input.'
    else if (!isValidEmailFormat(email)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Fill this input.'

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      setErrorKey((prev) => prev + 1)
      scrollFirstFormErrorIntoView('.auth-form')
      return false
    }
    return true
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await signInWithEmail({ email: email.trim().toLowerCase(), password })
      navigate('/')
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to sign in.' })
      setErrorKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignIn(): void {
    void signInWithGoogle()
  }

  return {
    email,
    errorKey,
    errors,
    handleGoogleSignIn,
    handleSubmit,
    loading,
    password,
    setEmail,
    setPassword,
    setShowPassword,
    showPassword,
  }
}
