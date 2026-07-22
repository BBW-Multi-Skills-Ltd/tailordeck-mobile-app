import { useEffect, useMemo, useState } from 'react'
import type { JobMeasurementSnapshot } from '../../data/mockJobMeasurements'
import type { JobWithRelations } from '../../services/types'
import { buildMeasurementDrafts } from './clientMeasurementMappers'
export { blockKey, toTitleCase } from './clientMeasurementUtils'

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
