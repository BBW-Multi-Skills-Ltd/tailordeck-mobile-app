import { describe, expect, it } from 'vitest'
import { ADMIN_SUPPORT_STATUS_LABELS, formatSupportDate, ticketNumber, USER_SUPPORT_STATUS_LABELS } from '../supportFormat'

describe('support formatting', () => {
  it('builds a short upper-case ticket number', () => {
    expect(ticketNumber('06e2ea46-2003-41a7-b708-f81b56db6aeb')).toBe('#06E2EA46')
  })

  it('uses user wording in the app and staff wording in the admin', () => {
    expect(USER_SUPPORT_STATUS_LABELS.open).toBe('Received')
    expect(ADMIN_SUPPORT_STATUS_LABELS.open).toBe('New')
    expect(USER_SUPPORT_STATUS_LABELS.resolved).toBe(ADMIN_SUPPORT_STATUS_LABELS.resolved)
  })

  it('includes the year unless a short date is requested', () => {
    const value = '2026-10-07T20:05:00Z'
    expect(formatSupportDate(value)).toMatch(/2026/)
    expect(formatSupportDate(value, { short: true })).not.toMatch(/2026/)
  })
})
