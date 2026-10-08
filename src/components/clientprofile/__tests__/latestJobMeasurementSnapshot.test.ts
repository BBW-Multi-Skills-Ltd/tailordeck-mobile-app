import { describe, expect, it } from 'vitest'
import type { JobWithRelations } from '../../../services/types'
import { latestJobMeasurementSnapshot } from '../clientMeasurementMappers'

function person(overrides: Record<string, unknown>) {
  return {
    id: 'p1',
    name: 'Ada',
    person_name: 'Ada',
    sex: 'Female',
    role: 'adult',
    item_type: null,
    description: null,
    measurement_kind: 'body',
    measurement_unit: 'inches',
    quantity: 1,
    measurements: { bust: 36 },
    sort_order: 1,
    ...overrides,
  }
}

function job(overrides: Record<string, unknown>): JobWithRelations {
  return {
    id: 'j1',
    status: 'pending',
    created_at: '2026-10-01T10:00:00Z',
    make_category: 'Body Wear',
    order_scope: 'Single',
    item_type: 'Gown',
    title: 'Gown',
    description: null,
    job_persons: [person({})],
    ...overrides,
  } as unknown as JobWithRelations
}

describe('latestJobMeasurementSnapshot (repeat orders)', () => {
  it('returns undefined when the client has no jobs', () => {
    expect(latestJobMeasurementSnapshot([])).toBeUndefined()
  })

  it('prefers a completed job over a newer pending one', () => {
    const snapshot = latestJobMeasurementSnapshot([
      job({ id: 'new', status: 'pending', created_at: '2026-10-05T10:00:00Z', item_type: 'Newer' }),
      job({ id: 'done', status: 'completed', created_at: '2026-09-01T10:00:00Z', item_type: 'Completed one' }),
    ])
    expect(snapshot?.itemType).toBe('Completed one')
  })

  it('keeps every person of a couple job with their measurements', () => {
    const snapshot = latestJobMeasurementSnapshot([
      job({
        order_scope: 'Couple',
        job_persons: [
          person({ id: 'a', name: 'Tunde', sex: 'Male', sort_order: 1, measurements: { chest: 40 } }),
          person({ id: 'b', name: 'Ada', sex: 'Female', sort_order: 2, measurements: { bust: '36' } }),
        ],
      }),
    ])
    expect(snapshot?.kind).toBe('body')
    if (snapshot?.kind !== 'body') return
    expect(snapshot.orderScope).toBe('Couple')
    expect(snapshot.persons.map((p) => p.name)).toEqual(['Tunde', 'Ada'])
    expect(snapshot.persons[1].measurements).toEqual({ bust: 36 })
  })

  it('maps a non-body item with quantity and measurements', () => {
    const snapshot = latestJobMeasurementSnapshot([
      job({
        make_category: 'Non-Body Item',
        job_persons: [person({ measurement_kind: 'non_body', item_type: 'Curtain', quantity: 3, measurements: { width: 50 } })],
      }),
    ])
    expect(snapshot).toMatchObject({ kind: 'non-body', itemType: 'Curtain', quantity: 3, measurements: { width: 50 } })
  })

  it('skips jobs without measurements', () => {
    const snapshot = latestJobMeasurementSnapshot([
      job({ id: 'empty', status: 'completed', job_persons: [] }),
      job({ id: 'withData', status: 'pending', item_type: 'Agbada' }),
    ])
    expect(snapshot?.itemType).toBe('Agbada')
  })
})
