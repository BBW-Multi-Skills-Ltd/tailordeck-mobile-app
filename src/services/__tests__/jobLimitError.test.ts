import { describe, expect, it, vi } from 'vitest'

// jobService imports the Supabase client, which needs env vars; the translation logic does not.
vi.mock('../../lib/supabase', () => ({ supabase: {} }))

const { toJobLimitError } = await import('../jobService')

describe('toJobLimitError (plan limit raised inside save_full_job)', () => {
  it('turns the Free plan trigger error into the upgrade message', () => {
    const result = toJobLimitError({ message: 'Free plan job limit reached. Upgrade to Starter to create more jobs.' })
    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toMatch(/Free plan limit/)
    expect((result as Error).message).toMatch(/3 jobs/)
  })

  it('turns inactive-plan trigger errors into the view-plans message', () => {
    const result = toJobLimitError({ message: 'Your current plan cannot create jobs right now.' })
    expect((result as Error).message).toMatch(/View plans/)
  })

  it('leaves unrelated errors untouched', () => {
    const original = { message: 'duplicate key value violates unique constraint' }
    expect(toJobLimitError(original)).toBe(original)
  })
})
