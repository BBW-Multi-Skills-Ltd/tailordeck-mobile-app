import { afterEach, describe, expect, it, vi } from 'vitest'
import { toLocalDateKey, toLocalMonthKey } from '../localDate'
import { LIST_PAGE_SIZE, toIlikeTerm, toListPage } from '../../services/listPaging'

describe('local dates', () => {
  it('uses the phone calendar day, not UTC', () => {
    // 00:30 on 1 March in local time is still February in UTC for timezones east of UTC (e.g. Lagos).
    const justAfterMidnight = new Date(2026, 2, 1, 0, 30)
    expect(toLocalDateKey(justAfterMidnight)).toBe('2026-03-01')
    expect(toLocalMonthKey(justAfterMidnight)).toBe('2026-03')
  })
})

describe('list paging', () => {
  it('escapes LIKE wildcards typed by the user', () => {
    expect(toIlikeTerm('  Amina ')).toBe('%Amina%')
    expect(toIlikeTerm('50%_off')).toBe('%50\\%\\_off%')
    expect(toIlikeTerm('   ')).toBeNull()
  })

  it('reports another page only when an extra row came back', () => {
    const fullPagePlusOne = Array.from({ length: LIST_PAGE_SIZE + 1 }, (_, index) => index)
    expect(toListPage(fullPagePlusOne, 0, (row) => row)).toMatchObject({ nextOffset: LIST_PAGE_SIZE })
    expect(toListPage(fullPagePlusOne, 0, (row) => row).items).toHaveLength(LIST_PAGE_SIZE)
    expect(toListPage([1, 2, 3], 50, (row) => row)).toEqual({ items: [1, 2, 3], nextOffset: null })
  })
})

describe('new job autosave', () => {
  const store = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  })

  afterEach(() => store.clear())

  it('restores only for the same user and skips photo files', async () => {
    const { readNewJobAutosave, restoreNewJobAutosave, saveNewJobAutosave } = await import('../../components/newjob/newJobAutosave')
    const setClientName = vi.fn()
    const setReferencePhotoFiles = vi.fn()
    const state = {
      clientName: 'Amina',
      clientPhone: '',
      step: 1,
      referencePhotoFiles: [new Blob(['x'])],
      setClientName,
      setReferencePhotoFiles,
      setStepFourReviewMode: vi.fn(),
    } as unknown as Parameters<typeof saveNewJobAutosave>[1]

    saveNewJobAutosave('user-a', state)
    expect(readNewJobAutosave('user-b')).toBeNull()

    saveNewJobAutosave('user-a', state)
    const stored = readNewJobAutosave('user-a')
    expect(stored?.values.clientName).toBe('Amina')
    expect(stored?.values).not.toHaveProperty('referencePhotoFiles')

    restoreNewJobAutosave(state, stored!)
    expect(setClientName).toHaveBeenCalledWith('Amina')
    expect(setReferencePhotoFiles).not.toHaveBeenCalled()
  })
})
