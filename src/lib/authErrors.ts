import { isAuthError } from '@supabase/supabase-js'
import { PASSWORD_RULE_MESSAGE } from '../validation/authSchemas'

// Supabase Auth errors shown to people in plain words (docs/05 SEC-14). The raw Supabase text is never shown:
// it is technical and can reveal details about accounts. The app's own validation messages pass through.

const RATE_LIMITED = 'Too many attempts. Please wait a few minutes and try again.'
const OFFLINE = 'Cannot reach TailorDeck. Check your internet connection and try again.'

const BY_CODE: Record<string, string> = {
  invalid_credentials: 'Email or password is incorrect.',
  email_not_confirmed: 'Please verify your email first. Check your inbox for the 8-digit code.',
  user_already_exists: 'This email may already have an account. Try signing in, or reset your password.',
  email_exists: 'This email may already have an account. Try signing in, or reset your password.',
  weak_password: PASSWORD_RULE_MESSAGE,
  same_password: 'Your new password must be different from your current one.',
  otp_expired: 'This code is incorrect or has expired. Please request a new code.',
  reauthentication_needed: 'Request a security code first, then enter it.',
  reauth_nonce_missing: 'Request a security code first, then enter it.',
  reauthentication_not_valid: 'This security code is incorrect or has expired.',
  email_address_invalid: 'Enter a valid email address.',
  validation_failed: 'Please check your details and try again.',
  user_banned: 'This account cannot sign in. Contact support@tailordeck.app.',
  signup_disabled: 'Sign-up is not available right now. Please try again later.',
  over_email_send_rate_limit: RATE_LIMITED,
  over_request_rate_limit: RATE_LIMITED,
  over_sms_send_rate_limit: RATE_LIMITED,
}

export function friendlyAuthError(error: unknown, fallback: string): string {
  if (isAuthError(error)) {
    const code = error.code ?? ''
    if (BY_CODE[code]) return BY_CODE[code]
    if (error.status === 429) return RATE_LIMITED
    if (error.name === 'AuthRetryableFetchError' || error.status === 0) return OFFLINE
    if (error.name === 'AuthWeakPasswordError') return PASSWORD_RULE_MESSAGE
    console.warn('Unmapped auth error:', code || error.name, error.status)
    return fallback
  }
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) return OFFLINE
  // The app's own messages (validation, ServiceError) are already written for people.
  if (error instanceof Error && error.message) return error.message
  return fallback
}
