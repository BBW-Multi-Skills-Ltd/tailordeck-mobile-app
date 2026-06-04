import type { JobMeasurementSnapshot } from '../../data/mockJobMeasurements'
import type { MockJob } from '../../types/job'
import { BodyMeasurementCard } from './BodyMeasurementCard'
import { NonBodyMeasurementCard } from './NonBodyMeasurementCard'
import { blockKey } from './useClientMeasurements'

type ClientMeasurementsSectionProps = {
  measurementDrafts: Record<string, JobMeasurementSnapshot>
  measurementJobs: MockJob[]
  isEditing: (key: string) => boolean
  onToggleEdit: (key: string) => void
  onUpdateBodyMeasurement: (jobId: string, personId: string, field: string, value: string) => void
  onUpdateNonBodyMeasurement: (jobId: string, field: string, value: string) => void
}

export default function ClientMeasurementsSection({
  isEditing,
  measurementDrafts,
  measurementJobs,
  onToggleEdit,
  onUpdateBodyMeasurement,
  onUpdateNonBodyMeasurement,
}: ClientMeasurementsSectionProps) {
  if (measurementJobs.length === 0) {
    return <p className="text-sm text-muted">The profile is not recorded for this client. Create a job for this client first.</p>
  }

  return (
    <div className="stack gap-12">
      {measurementJobs.map((job) => {
        const snapshot = measurementDrafts[job.id]
        if (!snapshot) return null

        return (
          <div key={job.id} className="stack gap-10">
            {snapshot.kind === 'body' ? (
              snapshot.persons.map((person) => (
                <BodyMeasurementCard
                  key={person.id}
                  editing={isEditing(blockKey(job.id, person.id))}
                  jobId={job.id}
                  person={person}
                  snapshot={snapshot}
                  onToggleEdit={onToggleEdit}
                  onUpdateMeasurement={onUpdateBodyMeasurement}
                />
              ))
            ) : (
              <NonBodyMeasurementCard
                editing={isEditing(blockKey(job.id))}
                jobId={job.id}
                snapshot={snapshot}
                onToggleEdit={onToggleEdit}
                onUpdateMeasurement={onUpdateNonBodyMeasurement}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
