import { PencilLine, Ruler, Save } from 'lucide-react'
import { labelFromField, type JobMeasurementSnapshot } from '../../data/mockJobMeasurements'
import type { MockJob } from '../../types/job'
import { blockKey, toTitleCase } from './useClientMeasurements'

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
  return (
    <div className="stack gap-12">
      {measurementJobs.length === 0 ? (
        <p className="text-sm text-muted">The profile is not recorded for this client. Create a job for this client first.</p>
      ) : (
        measurementJobs.map((job) => {
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
        })
      )}
    </div>
  )
}

function BodyMeasurementCard({
  editing,
  jobId,
  person,
  snapshot,
  onToggleEdit,
  onUpdateMeasurement,
}: {
  editing: boolean
  jobId: string
  person: Extract<JobMeasurementSnapshot, { kind: 'body' }>['persons'][number]
  snapshot: Extract<JobMeasurementSnapshot, { kind: 'body' }>
  onToggleEdit: (key: string) => void
  onUpdateMeasurement: (jobId: string, personId: string, field: string, value: string) => void
}) {
  const key = blockKey(jobId, person.id)

  return (
    <article className="card stack gap-10">
      <MeasurementHeader
        editing={editing}
        subtitle={`${person.name} - ${person.sex} (${toTitleCase(person.role)})`}
        onToggle={() => onToggleEdit(key)}
      />

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

function NonBodyMeasurementCard({
  editing,
  jobId,
  snapshot,
  onToggleEdit,
  onUpdateMeasurement,
}: {
  editing: boolean
  jobId: string
  snapshot: Extract<JobMeasurementSnapshot, { kind: 'non-body' }>
  onToggleEdit: (key: string) => void
  onUpdateMeasurement: (jobId: string, field: string, value: string) => void
}) {
  const key = blockKey(jobId)

  return (
    <article className="card stack gap-10">
      <MeasurementHeader editing={editing} subtitle={`${snapshot.itemType} - Qty ${snapshot.quantity}`} onToggle={() => onToggleEdit(key)} />
      {snapshot.description ? <p className="text-sm text-muted">{snapshot.description}</p> : null}

      <div className="client-measure-grid">
        {Object.entries(snapshot.measurements).map(([field, value]) => (
          <MeasurementValue
            key={`${jobId}-${field}`}
            editing={editing}
            field={field}
            unit={snapshot.unit}
            value={value}
            onChange={(nextValue) => onUpdateMeasurement(jobId, field, nextValue)}
          />
        ))}
      </div>
    </article>
  )
}

function MeasurementHeader({ editing, onToggle, subtitle }: { editing: boolean; onToggle: () => void; subtitle: string }) {
  return (
    <div className="row-between">
      <div className="stack gap-6">
        <p className="row gap-6 text-sm font-semibold">
          <Ruler size={16} className="client-measure-title-icon" />
          Measurement
        </p>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      <button type="button" className={`btn ${editing ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={onToggle}>
        {editing ? <Save size={14} /> : <PencilLine size={14} />}
        {editing ? 'Save' : 'Edit'}
      </button>
    </div>
  )
}

function MeasurementValue({ editing, field, onChange, unit, value }: { editing: boolean; field: string; onChange: (value: string) => void; unit: string; value: number }) {
  return (
    <div className="client-measure-item">
      <p className="text-sm text-muted">
        {labelFromField(field)} ({unit})
      </p>
      {editing ? <input className="input client-measure-input" value={String(value)} onChange={(event) => onChange(event.target.value)} inputMode="decimal" /> : <p className="client-measure-value">{value}</p>}
    </div>
  )
}
