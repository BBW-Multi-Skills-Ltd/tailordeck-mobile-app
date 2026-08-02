import { useMemo, useState } from 'react'
import type { JobMeasurementSnapshot } from '../../types/measurements'
import type { JobWithRelations } from '../../services/types'
import { buildMeasurementDrafts } from './clientMeasurementMappers'
export { blockKey, toTitleCase } from './clientMeasurementUtils'

export function useClientMeasurements(jobs: JobWithRelations[] = []) {
  const sourceKey = useMemo(
    () => jobs.map((job) => `${job.id}:${job.updated_at ?? ''}:${job.job_persons?.length ?? 0}`).join('|'),
    [jobs],
  )
  const initialDrafts = useMemo(() => buildMeasurementDrafts(jobs), [jobs])
  const [draftState, setDraftState] = useState(() => ({ drafts: initialDrafts, sourceKey }))
  const [editState, setEditState] = useState(() => ({ sourceKey, value: {} as Record<string, boolean> }))
  const measurementDrafts = draftState.sourceKey === sourceKey ? draftState.drafts : initialDrafts
  const activeEditState = editState.sourceKey === sourceKey ? editState.value : {}

  function setCurrentDrafts(updater: (drafts: Record<string, JobMeasurementSnapshot>) => Record<string, JobMeasurementSnapshot>): void {
    setDraftState((currentState) => {
      const currentDrafts = currentState.sourceKey === sourceKey ? currentState.drafts : initialDrafts
      return { drafts: updater(currentDrafts), sourceKey }
    })
  }

  function isEditing(key: string): boolean {
    return Boolean(activeEditState[key])
  }

  function toggleEdit(key: string): void {
    setEditState((currentState) => {
      const currentEditState = currentState.sourceKey === sourceKey ? currentState.value : {}
      return { sourceKey, value: { ...currentEditState, [key]: !currentEditState[key] } }
    })
  }

  function updateBodyMeasurement(jobId: string, personId: string, field: string, value: string): void {
    const parsed = Number(value)
    setCurrentDrafts((prev) => {
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
    setCurrentDrafts((prev) => {
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
