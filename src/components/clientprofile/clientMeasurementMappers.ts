import type { JobMeasurementSnapshot } from '../../data/mockJobMeasurements'
import type { JobPersonRow, JobWithRelations } from '../../services/types'

export function buildMeasurementDrafts(jobs: JobWithRelations[]): Record<string, JobMeasurementSnapshot> {
  const entries = jobs
    .map((job) => {
      const snapshot = mapJobToMeasurementSnapshot(job)
      return snapshot ? [job.id, snapshot] as const : null
    })
    .filter((entry): entry is readonly [string, JobMeasurementSnapshot] => Boolean(entry))

  return Object.fromEntries(entries)
}

function mapJobToMeasurementSnapshot(job: JobWithRelations): JobMeasurementSnapshot | null {
  const persons = [...(job.job_persons ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  if (persons.length === 0) return null

  const nonBodyPerson = persons.find((person) => person.measurement_kind === 'non_body')
  if (job.make_category === 'Non-Body Item' && nonBodyPerson) {
    return {
      kind: 'non-body',
      orderScope: 'Single',
      unit: nonBodyPerson.measurement_unit,
      itemType: nonBodyPerson.item_type || job.item_type || job.title || 'Item',
      quantity: Number(nonBodyPerson.quantity || 1),
      description: nonBodyPerson.description || job.description || undefined,
      measurements: normalizeMeasurements(nonBodyPerson.measurements),
    }
  }

  const bodyPersons = persons.filter((person) => person.measurement_kind === 'body')
  if (bodyPersons.length === 0) return null

  return {
    kind: 'body',
    orderScope: job.order_scope,
    unit: bodyPersons[0]?.measurement_unit ?? 'inches',
    itemType: job.item_type || job.title || 'Body wear',
    persons: bodyPersons.map(mapBodyPerson),
  }
}

function mapBodyPerson(person: JobPersonRow): Extract<JobMeasurementSnapshot, { kind: 'body' }>['persons'][number] {
  return {
    id: person.id,
    name: person.name,
    sex: person.sex,
    role: person.role,
    itemType: person.item_type || undefined,
    description: person.description || undefined,
    measurements: normalizeMeasurements(person.measurements),
  }
}

function normalizeMeasurements(measurements: Record<string, number | string>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(measurements ?? {}).map(([field, value]) => {
      const parsed = typeof value === 'number' ? value : Number(value)
      return [field, Number.isNaN(parsed) ? 0 : parsed]
    }),
  )
}
