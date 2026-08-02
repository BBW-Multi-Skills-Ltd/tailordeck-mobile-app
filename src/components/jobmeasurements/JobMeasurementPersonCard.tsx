import { Check, Edit3, Ruler, Save } from 'lucide-react'
import { labelFromField } from '../../types/measurements'
import type { JobPersonRow } from '../../services/types'
import { getDraftKey, getPersonName, toTitleCase } from './jobMeasurementsUtils'

type JobMeasurementPersonCardProps = {
  drafts: Record<string, string>
  initialDrafts: Record<string, string>
  isEditing: boolean
  isPending: boolean
  isSaved: boolean
  person: JobPersonRow
  onEdit: () => void
  onSave: () => void
  onUpdateDraft: (key: string, value: string) => void
}

export function JobMeasurementPersonCard({ drafts, initialDrafts, isEditing, isPending, isSaved, onEdit, onSave, onUpdateDraft, person }: JobMeasurementPersonCardProps) {
  const fields = Object.entries(person.measurements ?? {})

  return (
    <article className="card stack gap-10">
      <div className="row-between gap-10">
        <div className="stack gap-6 min-w-0">
          <p className="row gap-6 text-sm font-semibold">
            <Ruler size={16} className="client-measure-title-icon" />
            {person.measurement_kind === 'body' ? 'Body Measurement' : 'Item Measurement'}
          </p>
          <p className="text-sm text-muted">
            {getPersonName(person)} - {person.sex} ({toTitleCase(person.role)})
          </p>
        </div>
        <button
          type="button"
          className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'} btn-icon`}
          disabled={isPending}
          onClick={isEditing ? onSave : onEdit}
          aria-label={isEditing ? 'Save measurements' : 'Edit measurements'}
        >
          {isSaved ? <Check size={17} /> : isEditing ? <Save size={17} /> : <Edit3 size={17} />}
        </button>
      </div>

      {person.item_type ? <p className="text-sm text-muted">Item: {person.item_type}</p> : null}
      {person.description ? <p className="text-sm text-muted">Note: {person.description}</p> : null}
      {person.measurement_kind === 'non_body' ? <p className="text-sm text-muted">Quantity: {person.quantity ?? 1}</p> : null}

      {fields.length > 0 ? (
        <div className="client-measure-grid">
          {fields.map(([field]) => {
            const draftKey = getDraftKey(person.id, field)
            return (
              <label key={`${person.id}-${field}`} className="client-measure-item">
                <p className="text-sm text-muted">{labelFromField(field)} ({person.measurement_unit})</p>
                {isEditing ? (
                  <input
                    className="input client-measure-input"
                    value={drafts[draftKey] ?? initialDrafts[draftKey] ?? ''}
                    onChange={(event) => onUpdateDraft(draftKey, event.target.value)}
                    inputMode="decimal"
                  />
                ) : (
                  <p className="client-measure-value">{drafts[draftKey] ?? initialDrafts[draftKey] ?? '-'}</p>
                )}
              </label>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted">No measurement values were filled for this person.</p>
      )}
    </article>
  )
}
