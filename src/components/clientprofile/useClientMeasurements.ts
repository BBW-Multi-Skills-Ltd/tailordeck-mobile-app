import { useEffect, useMemo, useState } from 'react'
import type { JobMeasurementSnapshot } from '../../data/mockJobMeasurements'
import type { JobPersonRow, JobWithRelations } from '../../services/types'

export function useClientMeasurements(jobs: JobWithRelations[] = []) {
  const initialDrafts = useMemo(() => buildMeasurementDrafts(jobs), [jobs])
  const [measurementDrafts, setMeasurementDrafts] = useState<Record<string, JobMeasurementSnapshot>>(initialDrafts)
  const [editState, setEditState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setMeasurementDrafts(initialDrafts)
    setEditState({})
  }, [initialDrafts])

  function isEditing(key: string): boolean {
    return Boolean(editState[key])
  }

  function toggleEdit(key: string): void {
    setEditState((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function updateBodyMeasurement(jobId: string, personId: string, field: string, value: string): void {
    const parsed = Number(value)
    setMeasurementDrafts((prev) => {
      const current = prev[jobId]
      if (!current || current.kind !== 'body') return prev

      return {
        ...prev,
        [jobId]: {
          ...current,
          persons: current.persons.map((person) =>
            person.id === personId
              ? {
                  ...person,
                  measurements: { ...person.measurements, [field]: Number.isNaN(parsed) ? 0 : parsed },
                }
              : person,
          ),
        },
      }
    })
  }

  function updateNonBodyMeasurement(jobId: string, field: string, value: string): void {
    const parsed = Number(value)
    setMeasurementDrafts((prev) => {
      const current = prev[jobId]
      if (!current || current.kind !== 'non-body') return prev

      return {
        ...prev,
        [jobId]: {
          ...current,
          measurements: { ...current.measurements, [field]: Number.isNaN(parsed) ? 0 : parsed },
        },
      }
    })
  }

  return {
    isEditing,
    measurementDrafts,
    toggleEdit,
    updateBodyMeasurement,
    updateNonBodyMeasurement,
  }
}

export function blockKey(jobId: string, personId?: string): string {
  return personId ? `${jobId}:${personId}` : `${jobId}:non-body`
}

export function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function buildMeasurementDrafts(jobs: JobWithRelations[]): Record<string, JobMeasurementSnapshot> {
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
