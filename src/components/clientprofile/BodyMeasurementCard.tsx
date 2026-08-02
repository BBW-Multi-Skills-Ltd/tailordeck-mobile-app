import type { JobMeasurementSnapshot } from '../../types/measurements'
import { blockKey, toTitleCase } from './useClientMeasurements'
import { MeasurementHeader } from './MeasurementHeader'
import { MeasurementValue } from './MeasurementValue'

type BodyMeasurementCardProps = {
  editing: boolean
  jobId: string
  person: Extract<JobMeasurementSnapshot, { kind: 'body' }>['persons'][number]
  snapshot: Extract<JobMeasurementSnapshot, { kind: 'body' }>
  onToggleEdit: (key: string) => void
  onUpdateMeasurement: (jobId: string, personId: string, field: string, value: string) => void
}

export function BodyMeasurementCard({ editing, jobId, person, snapshot, onToggleEdit, onUpdateMeasurement }: BodyMeasurementCardProps) {
  const key = blockKey(jobId, person.id)

  return (
    <article className="card stack gap-10">
      <MeasurementHeader editing={editing} subtitle={`${person.name} - ${person.sex} (${toTitleCase(person.role)})`} onToggle={() => onToggleEdit(key)} />
      {person.description ? <p className="text-sm text-muted">{person.description}</p> : null}

      <div className="client-measure-grid">
        {Object.entries(person.measurements).map(([field, value]) => (
          <MeasurementValue
            key={`${jobId}-${person.id}-${field}`}
            editing={editing}
            field={field}
            unit={snapshot.unit}
            value={value}
            onChange={(nextValue) => onUpdateMeasurement(jobId, person.id, field, nextValue)}
          />
        ))}
      </div>
    </article>
  )
}
