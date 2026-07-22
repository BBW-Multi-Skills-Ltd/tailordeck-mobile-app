import { describe, expect, it } from 'vitest'
import { formatNaira, formatNairaFromNaira, toKobo, toNaira } from '../money'

describe('money utilities', () => {
  it('converts naira to kobo using integer storage', () => {
    expect(toKobo(2500)).toBe(250000)
    expect(toKobo(12.45)).toBe(1245)
  })

  it('handles invalid naira values safely', () => {
    expect(toKobo(Number.NaN)).toBe(0)
    expect(toKobo(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('formats kobo as Nigerian naira', () => {
    const naira = String.fromCharCode(0x20a6)
    expect(toNaira(250000)).toBe(2500)
    expect(formatNaira(250000)).toBe(`${naira}2,500`)
    expect(formatNairaFromNaira(2500)).toBe(`${naira}2,500`)
  })
})
