import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadTailorSettings, saveTailorSettings, TAILOR_SIGNUP_PREFILL_KEY } from '../../lib/settings'
import { signInWithGoogle, signUpWithEmail } from '../../services/authService'
import { syncPendingOnboardingSettings } from '../../services/onboardingService'
import { parseAuthInput, signUpFormSchema } from '../../validation/authSchemas'

export function useSignUpForm() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const strength = useMemo(() => calculatePasswordStrength(password), [password])
  const passwordLabel = strength <= 1 ? 'Weak password' : strength <= 3 ? 'Medium password' : 'Strong password'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    try {
      parseAuthInput(signUpFormSchema, { agree, confirmPassword, email, fullName, password, phone })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Please review your details.')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = `+234${phone.replace(/\D/g, '')}`
    setLoading(true)
    try {
      await signUpWithEmail({ fullName, email: normalizedEmail, password, phone: normalizedPhone })
      const currentSettings = loadTailorSettings()
      const nextSettings = saveTailorSettings({
        ...currentSettings,
        profile: {
          ...currentSettings.profile,
          fullName: fullName.trim() || currentSettings.profile.fullName,
          email: normalizedEmail,
          phone: normalizedPhone,
        },
      })
      window.localStorage.setItem(TAILOR_SIGNUP_PREFILL_KEY, JSON.stringify({
        fullName: nextSettings.profile.fullName,
        email: normalizedEmail,
        shopName: nextSettings.businessInfo.shopName,
      }))
      try {
        await syncPendingOnboardingSettings(nextSettings)
      } catch (syncError) {
        console.warn('Unable to sync onboarding settings after signup:', syncError)
      }
      navigate('/onboarding/plan')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignUp() {
    void signInWithGoogle()
  }

  return {
    agree,
    confirmPassword,
    email,
    errorMessage,
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

function calculatePasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}
