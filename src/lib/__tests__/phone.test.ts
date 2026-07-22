import { describe, expect, it } from 'vitest'
import { formatNigerianPhoneDisplay, normalizeNigerianPhone } from '../phone'

describe('phone utilities', () => {
  it('normalizes local Nigerian phone numbers', () => {
    expect(normalizeNigerianPhone('08012345678')).toBe('2348012345678')
    expect(normalizeNigerianPhone('+234 801 234 5678')).toBe('2348012345678')
  })

  it('prefixes bare local numbers with country code', () => {
    expect(normalizeNigerianPhone('8012345678')).toBe('2348012345678')
  })

  it('preserves empty input and formats display value', () => {
    expect(normalizeNigerianPhone('')).toBe('')
    expect(formatNigerianPhoneDisplay('08012345678')).toBe('+2348012345678')
  })
})
