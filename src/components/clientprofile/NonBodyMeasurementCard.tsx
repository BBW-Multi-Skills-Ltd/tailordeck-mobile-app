import type { JobMeasurementSnapshot } from '../../types/measurements'
import { blockKey } from './useClientMeasurements'
import { MeasurementHeader } from './MeasurementHeader'
import { MeasurementValue } from './MeasurementValue'

type NonBodyMeasurementCardProps = {
  editing: boolean
  jobId: string
  snapshot: Extract<JobMeasurementSnapshot, { kind: 'non-body' }>
  onToggleEdit: (key: string) => void
  onUpdateMeasurement: (jobId: string, field: string, value: string) => void
}

export function NonBodyMeasurementCard({ editing, jobId, snapshot, onToggleEdit, onUpdateMeasurement }: NonBodyMeasurementCardProps) {
  const key = blockKey(jobId)

  return (
    <article className="card stack gap-10">
      <MeasurementHeader editing={editing} subtitle={`${snapshot.itemType} - Qty ${snapshot.quantity}`} onToggle={() => onToggleEdit(key)} />
      {snapshot.description ? <p className="text-sm text-muted">{snapshot.description}</p> : null}

      <div className="client-measure-grid">
        {Object.entries(snapshot.measurements).map(([field, value]) => (
          <MeasurementValue key={`${jobId}-${field}`} editing={editing} field={field} unit={snapshot.unit} value={value} onChange={(nextValue) => onUpdateMeasurement(jobId, field, nextValue)} />
        ))}
      </div>
    </article>
  )
}
