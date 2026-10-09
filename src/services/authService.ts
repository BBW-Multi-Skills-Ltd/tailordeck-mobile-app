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

/**
 * Emails a password reset code. The app works on Android only (inside it the page origin is
 * https://localhost), so the reset is completed with the code in the app rather than with an email link.
 * The Supabase "Reset Password" email template must include {{ .Token }}.
 */
export async function sendPasswordReset(email: string) {
  const safeInput = parseAuthInput(passwordResetSchema, { email })
  const { data, error } = await supabase.auth.resetPasswordForEmail(safeInput.email)
  if (error) throw error
  return data
}

/** Exchanges the emailed reset code for a short recovery session, so the new password can be saved. */
export async function verifyPasswordResetCode(input: { email: string; token: string }) {
  const safeInput = parseAuthInput(emailOtpSchema, input)
  const { data, error } = await supabase.auth.verifyOtp({
    email: safeInput.email,
    token: safeInput.token,
    type: 'recovery',
  })
  if (error) throw error
  return data
}

export async function updateLoginEmail(input: { email: string; nonce?: string }): Promise<boolean> {
  const safeInput = parseAuthInput(emailUpdateSchema, input)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const currentEmail = userData.user?.email?.trim().toLowerCase()
  if (currentEmail === safeInput.email) return false

  const { error } = await supabase.auth.updateUser({
    email: safeInput.email,
    ...(safeInput.nonce ? { nonce: safeInput.nonce } : {}),
  })
  if (error) throw error
  return true
}

export async function verifyLoginEmailChangeOtp(input: { email: string; token: string }) {
  const safeInput = parseAuthInput(emailOtpSchema, input)
  const { data, error } = await supabase.auth.verifyOtp({
    email: safeInput.email,
    token: safeInput.token,
    type: 'email_change',
  })
  if (error) throw error

  const responseEmail = data.user?.email?.trim().toLowerCase() || data.session?.user.email?.trim().toLowerCase()
  if (responseEmail === safeInput.email) return data

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const activeEmail = authData.user?.email?.trim().toLowerCase()
  if (activeEmail !== safeInput.email) {
    throw new Error('Email code was accepted, but Supabase has not switched the login email yet. Turn off Secure email change in Supabase Email provider settings, then try again.')
  }

  return data
}

/**
 * Proves the person holding the phone knows the account password before a destructive action
 * (delete or deactivate the account). Signs in again as the same user; throws the Supabase error if wrong.
 */
export async function verifyCurrentPassword(password: string): Promise<void> {
  const { data, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const email = data.user?.email
  if (!email) throw new Error('Sign in again to continue.')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
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
