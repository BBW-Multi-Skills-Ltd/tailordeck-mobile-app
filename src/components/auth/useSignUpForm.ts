import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type FieldErrors,
  isValidEmailFormat,
  isValidNigerianMobileLocal,
  localNigerianPhone,
  passwordChecks,
  passwordStrength,
} from '../../lib/formValidation'
import { scrollFirstFormErrorIntoView } from '../../lib/scroll'
import {
  loadTailorSettings,
  TAILOR_ONBOARDING_SYNC_PENDING_KEY,
} from '../../lib/settings'
import { signInWithGoogle, signUpWithEmail } from '../../services/authService'
import { completeAuthenticatedSignUp, savePendingSignUpHandoff } from './signUpHandoff'

type SignUpFieldKey = 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword' | 'agree' | 'form'
type ConfirmPasswordState = 'idle' | 'partial' | 'match' | 'mismatch'

export function useSignUpForm() {
  const navigate = useNavigate()
  const savedSettings = loadTailorSettings()
  const savedProfileEmail = savedSettings.profile.email === 'your@email.com' ? '' : savedSettings.profile.email
  const [fullName, setFullNameValue] = useState('')
  const [email, setEmailValue] = useState(savedSettings.businessInfo.businessEmail || savedProfileEmail)
  const [phone, setPhoneValue] = useState(localNigerianPhone(savedSettings.businessInfo.businessPhone || savedSettings.profile.phone))
  const [password, setPasswordValue] = useState('')
  const [confirmPassword, setConfirmPasswordValue] = useState('')
  const [agree, setAgreeValue] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<SignUpFieldKey>>({})
  const [errorKey, setErrorKey] = useState(0)

  const strength = useMemo(() => passwordStrength(password), [password])
  const checks = useMemo(() => passwordChecks(password), [password])
  const passwordLabel = strength <= 1 ? 'Weak password' : strength <= 3 ? 'Medium password' : 'Strong password'
  const confirmState: ConfirmPasswordState = getConfirmPasswordState(password, confirmPassword)

  function clearError(key: SignUpFieldKey): void {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  function setFullName(value: string): void {
    setFullNameValue(value)
    if (value.trim()) clearError('fullName')
  }

  function setEmail(value: string): void {
    setEmailValue(value)
    if (value.trim() && isValidEmailFormat(value)) clearError('email')
  }

  function setPhone(value: string): void {
    const next = localNigerianPhone(value)
    setPhoneValue(next)
    if (isValidNigerianMobileLocal(next)) clearError('phone')
  }

  function setPassword(value: string): void {
    setPasswordValue(value)
    if (passwordStrength(value) >= 4) clearError('password')
    if (confirmPassword && confirmPassword !== value) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }))
    }
  }

  function setConfirmPassword(value: string): void {
    setConfirmPasswordValue(value)
    if (value && value === password) clearError('confirmPassword')
  }

  function setAgree(value: boolean): void {
    setAgreeValue(value)
    if (value) clearError('agree')
  }

  function validate(): boolean {
    const nextErrors: FieldErrors<SignUpFieldKey> = {}
    if (!fullName.trim()) nextErrors.fullName = 'Fill this input.'
    if (!email.trim()) nextErrors.email = 'Fill this input.'
    else if (!isValidEmailFormat(email)) nextErrors.email = 'Enter a valid email address.'
    if (!phone.trim()) nextErrors.phone = 'Fill this input.'
    else if (!isValidNigerianMobileLocal(phone)) nextErrors.phone = 'Enter a valid Nigerian number.'
    if (!password) nextErrors.password = 'Fill this input.'
    else if (strength < 4) nextErrors.password = 'Use all password requirements.'
    if (!confirmPassword) nextErrors.confirmPassword = 'Fill this input.'
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.'
    if (!agree) nextErrors.agree = 'Accept the terms to continue.'

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

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = `+234${phone}`
    setLoading(true)
    try {
      const setupWasCompleted = window.localStorage.getItem(TAILOR_ONBOARDING_SYNC_PENDING_KEY) === 'true'
      const authData = await signUpWithEmail({ fullName, email: normalizedEmail, password, phone: normalizedPhone })
      const nextSettings = savePendingSignUpHandoff({ fullName, normalizedEmail, normalizedPhone, setupWasCompleted })

      if (!authData.session) {
        navigate('/auth/verify-email')
        return
      }

      await completeAuthenticatedSignUp({ navigate, nextSettings, setupWasCompleted })
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to create account.' })
      setErrorKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignUp() {
    void signInWithGoogle()
  }

  return {
    agree,
    checks,
    confirmPassword,
    confirmState,
    email,
    errorKey,
    errors,
    fullName,
    handleGoogleSignUp,
    handleSubmit,
    loading,
    password,
    passwordLabel,
    phone,
    setAgree,
    setConfirmPassword,
    setEmail,
    setFullName,
    setPassword,
    setPhone,
    setShowPassword,
    showPassword,
    strength,
  }
}

function getConfirmPasswordState(password: string, confirmPassword: string): ConfirmPasswordState {
  if (!password || !confirmPassword) return 'idle'
  if (confirmPassword === password) return 'match'
  if (password.startsWith(confirmPassword)) return 'partial'
  return 'mismatch'
}
