import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { markOnboardingStage, registerLocalAccount, setPreviewAuthenticated } from '../../lib/auth'
import { loadTailorSettings, saveTailorSettings, TAILOR_SIGNUP_PREFILL_KEY } from '../../lib/settings'

export function useSignUpForm() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const strength = useMemo(() => calculatePasswordStrength(password), [password])
  const passwordLabel = strength <= 1 ? 'Weak password' : strength <= 3 ? 'Medium password' : 'Strong password'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      window.alert('Enter at least email and password to create account.')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = `+234${phone.replace(/\D/g, '')}`
    registerLocalAccount({ fullName: fullName.trim(), email: normalizedEmail, phone: normalizedPhone, password })
    window.localStorage.setItem(TAILOR_SIGNUP_PREFILL_KEY, JSON.stringify({ fullName: fullName.trim(), email: normalizedEmail, shopName: '' }))
    const currentSettings = loadTailorSettings()
    saveTailorSettings({
      ...currentSettings,
      profile: {
        ...currentSettings.profile,
        fullName: fullName.trim() || currentSettings.profile.fullName,
        email: normalizedEmail,
        phone: normalizedPhone,
      },
    })
    setPreviewAuthenticated('signed-up')
    markOnboardingStage('setup')
    window.alert('Account created. Continue with setup.')
    navigate('/onboarding/setup')
  }

  return {
    agree,
    confirmPassword,
    email,
    fullName,
    handleSubmit,
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
