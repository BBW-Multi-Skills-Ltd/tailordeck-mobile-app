import { describe, expect, it } from 'vitest'
import { PASSWORD_RULE_MESSAGE, parseAuthInput, passwordUpdateSchema, signInSchema, signUpSchema } from '../authSchemas'

const signUp = (password: string) => () => parseAuthInput(signUpSchema, { email: 'tailor@example.com', password })

describe('password rule (8+ characters, letters and numbers)', () => {
  it('accepts a password with letters and numbers', () => {
    expect(signUp('adaeze2026')).not.toThrow()
    expect(parseAuthInput(passwordUpdateSchema, { password: 'Tailor-Shop-9', confirmPassword: 'Tailor-Shop-9' }).password).toBe('Tailor-Shop-9')
  })

  it('rejects short, letters-only and numbers-only passwords', () => {
    for (const weak of ['abc123', 'onlyletters', '12345678']) {
      expect(signUp(weak)).toThrow(PASSWORD_RULE_MESSAGE)
    }
  })

  it('still lets older accounts sign in with any password', () => {
    expect(parseAuthInput(signInSchema, { email: 'tailor@example.com', password: 'abc123' }).password).toBe('abc123')
  })
})
