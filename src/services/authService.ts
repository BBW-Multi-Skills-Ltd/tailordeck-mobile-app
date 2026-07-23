import { normalizeNigerianPhone } from '../lib/phone'
import { supabase } from '../lib/supabase'
import { parseAuthInput, passwordResetSchema, signInSchema, signUpSchema } from '../validation/authSchemas'

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

export async function sendPasswordReset(email: string) {
  const safeInput = parseAuthInput(passwordResetSchema, { email })
  const { data, error } = await supabase.auth.resetPasswordForEmail(safeInput.email, {
    redirectTo: `${window.location.origin}/auth/signin`,
  })
  if (error) throw error
  return data
}
