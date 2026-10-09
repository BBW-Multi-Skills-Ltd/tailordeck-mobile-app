import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { PASSWORD_RULE_MESSAGE } from '../../validation/authSchemas'
import { friendlyAuthError } from '../authErrors'

describe('friendlyAuthError', () => {
  it('maps Supabase auth errors to plain messages and never shows the raw text', () => {
    const wrongPassword = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials')
    expect(friendlyAuthError(wrongPassword, 'Unable to sign in.')).toBe('Email or password is incorrect.')
    expect(friendlyAuthError(new AuthApiError('Password is too weak', 422, 'weak_password'), 'x')).toBe(PASSWORD_RULE_MESSAGE)
    expect(friendlyAuthError(new AuthApiError('email rate limit exceeded', 429, 'over_email_send_rate_limit'), 'x')).toContain('Too many attempts')
  })

  it('uses the fallback for unknown auth errors', () => {
    expect(friendlyAuthError(new AuthApiError('Database error querying schema', 500, 'unexpected_failure'), 'Unable to sign in.')).toBe('Unable to sign in.')
  })

  it('explains connection problems', () => {
    expect(friendlyAuthError(new AuthRetryableFetchError('Failed to fetch', 0), 'x')).toContain('internet connection')
    expect(friendlyAuthError(new TypeError('Failed to fetch'), 'x')).toContain('internet connection')
  })

  it("keeps the app's own validation messages", () => {
    expect(friendlyAuthError(new Error('Enter a valid email address.'), 'x')).toBe('Enter a valid email address.')
  })
})
