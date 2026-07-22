import { Plus, X } from 'lucide-react'
import { labelFromField, type PersonForm } from '../newJobConfig'

export function MeasurementFieldsEditor({
  addCustomMeasurement,
  addMeasurementField,
  customFieldName,
  hiddenFields,
  measurementTitle,
  onUpdateMeasurement,
  person,
  removeMeasurementField,
  setCustomFieldName,
  setShowAddMeasurements,
  showAddMeasurements,
  visibleFields,
}: {
  person: PersonForm
  measurementTitle: string
  visibleFields: string[]
  hiddenFields: string[]
  customFieldName: string
  showAddMeasurements: boolean
  onUpdateMeasurement: (field: string, value: string) => void
  removeMeasurementField: (field: string) => void
  addMeasurementField: (field: string) => void
  addCustomMeasurement: () => void
  setCustomFieldName: (value: string) => void
  setShowAddMeasurements: (updater: (value: boolean) => boolean) => void
}) {
  return (
    <div className="stack gap-8">
      <div className="row-between">
        <p className="text-sm text-muted">{measurementTitle}</p>
        <span className="wizard-measurement-count">{visibleFields.length} fields</span>
      </div>
      <p className="wizard-measurement-helper">Common measurements are shown first. Remove what you do not need, then add more if this job requires it.</p>
      <div className="wizard-measurements-grid">
        {visibleFields.map((field) => (
          <div key={`${person.id}-${field}`} className="input-group wizard-measurement-field">
            <div className="row-between">
              <span className="input-label">{labelFromField(field)} (in)</span>
              <button type="button" className="wizard-measure-remove" onClick={() => removeMeasurementField(field)} aria-label={`Remove ${labelFromField(field)}`}>
                <X size={13} />
              </button>
            </div>
            <input className="input" value={person.measurements[field] ?? ''} onChange={(event) => onUpdateMeasurement(field, event.target.value)} placeholder="0" inputMode="decimal" />
          </div>
        ))}
      </div>

      {hiddenFields.length ? (
        <div className="wizard-add-measurements">
          <button
            type="button"
            className="wizard-add-measurements-toggle"
            onClick={() => setShowAddMeasurements((current) => !current)}
            aria-expanded={showAddMeasurements}
          >
            <Plus size={13} />
            Add measurement
            <span>{hiddenFields.length} available</span>
          </button>

          {showAddMeasurements ? (
            <div className="stack gap-8">
              <p className="wizard-add-measurements-title">Restore or add a field</p>
              <div className="wizard-add-measurements-row">
                {hiddenFields.map((field) => (
                  <button key={`${person.id}-add-${field}`} type="button" className="wizard-add-measurement-chip" onClick={() => addMeasurementField(field)}>
                    <Plus size={12} />
                    {labelFromField(field)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showAddMeasurements ? (
        <div className="wizard-custom-measurement">
          <input
            className="input"
            value={customFieldName}
            onChange={(event) => setCustomFieldName(event.target.value)}
            placeholder="Custom measurement name"
          />
          <button type="button" className="btn btn-secondary" onClick={addCustomMeasurement}>
            Add
          </button>
        </div>
      ) : null}
    </div>
  )
}
