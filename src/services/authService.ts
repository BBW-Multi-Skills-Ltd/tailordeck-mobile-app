import { normalizeNigerianPhone } from '../lib/phone'
import { supabase } from '../lib/supabase'
import {
  emailUpdateSchema,
  emailOtpSchema,
  parseAuthInput,
  passwordResetSchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from '../validation/authSchemas'

export async function signUpWithEmail(input: { fullName: string; email: string; password: string; phone: string }) {
  const safeInput = parseAuthInput(signUpSchema, input)
  const { data, error } = await supabase.auth.signUp({
    email: safeInput.email,
    password: safeInput.password,
    options: {
      data: {
        full_name: safeInput.fullName?.trim() || '',
        phone: safeInput.phone ? `+${normalizeNigerianPhone(safeInput.phone)}` : '',
      },
    },
  })
  if (error) throw error
  return data
}

export async function signInWithEmail(input: { email: string; password: string }) {
  const safeInput = parseAuthInput(signInSchema, input)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: safeInput.email,
    password: safeInput.password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  })
  if (error) throw error
  return data
}

export async function verifySignUpEmailOtp(input: { email: string; token: string }) {
  const safeInput = parseAuthInput(emailOtpSchema, input)
  const { data, error } = await supabase.auth.verifyOtp({
    email: safeInput.email,
    token: safeInput.token,
    type: 'email',
  })
  if (error) throw error
  return data
}

export async function resendSignUpEmailOtp(email: string) {
  const safeInput = parseAuthInput(passwordResetSchema, { email })
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: safeInput.email,
  })
  if (error) throw error
  return data
}

export async function sendPasswordReset(email: string) {
  const safeInput = parseAuthInput(passwordResetSchema, { email })
  const { data, error } = await supabase.auth.resetPasswordForEmail(safeInput.email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  if (error) throw error
  return data
}

export async function updateLoginEmail(email: string): Promise<boolean> {
  const safeInput = parseAuthInput(emailUpdateSchema, { email })
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const currentEmail = userData.user?.email?.trim().toLowerCase()
  if (currentEmail === safeInput.email) return false

  const { error } = await supabase.auth.updateUser({ email: safeInput.email })
  if (error) throw error
  return true
}

export async function requestPasswordSecurityCode() {
  const { data, error } = await supabase.auth.reauthenticate()
  if (error) throw error
  return data
}

export async function updateLoginPassword(input: { password: string; confirmPassword: string; nonce?: string }) {
  const safeInput = parseAuthInput(passwordUpdateSchema, input)
  const { data, error } = await supabase.auth.updateUser({
    password: safeInput.password,
    ...(safeInput.nonce ? { nonce: safeInput.nonce } : {}),
  })
  if (error) throw error
  return data
}
