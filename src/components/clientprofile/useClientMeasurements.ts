import { useState } from 'react'
import { appJobMeasurementById, appJobs } from '../../data/appData'
import type { JobMeasurementSnapshot } from '../../data/mockJobMeasurements'

export function useClientMeasurements(clientId?: string) {
  const [measurementDrafts, setMeasurementDrafts] = useState<Record<string, JobMeasurementSnapshot>>(() => {
    const entries = appJobs
      .filter((job) => job.clientId === clientId)
      .map((job) => {
        const snapshot = appJobMeasurementById[job.id]
        if (!snapshot) return [job.id, undefined] as const
        return [job.id, JSON.parse(JSON.stringify(snapshot)) as JobMeasurementSnapshot] as const
      })
      .filter((entry): entry is readonly [string, JobMeasurementSnapshot] => Boolean(entry[1]))

    return Object.fromEntries(entries)
  })
  const [editState, setEditState] = useState<Record<string, boolean>>({})

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
