import { labelFromField } from './newJobConfig'

type NonBodyMeasurementsFormProps = {
  quantity: string
  fields: string[]
  measurements: Record<string, string>
  description: string
  onQuantityChange: (value: string) => void
  onMeasurementChange: (field: string, value: string) => void
  onDescriptionChange: (value: string) => void
}

export default function NonBodyMeasurementsForm({
  quantity,
  fields,
  measurements,
  description,
  onQuantityChange,
  onMeasurementChange,
  onDescriptionChange,
}: NonBodyMeasurementsFormProps) {
  return (
    <div className="stack gap-8 wizard-step1-measurements">
      <div className="wizard-measurement-intro">
        <p className="input-label">Item Measurements</p>
        <p>Use these fields for items like duvet, curtains, cap, blanket, or covers.</p>
      </div>
      <article className="card stack gap-12">
        <label className="input-group">
          <span className="input-label">Quantity</span>
          <input className="input" value={quantity} onChange={(event) => onQuantityChange(event.target.value)} placeholder="1" inputMode="numeric" />
        </label>

        <div className="wizard-measurements-grid">
          {fields.map((field) => (
            <label key={field} className="input-group">
              <span className="input-label">{labelFromField(field)} (in)</span>
              <input
                className="input"
                value={measurements[field] ?? ''}
                onChange={(event) => onMeasurementChange(field, event.target.value)}
                placeholder="0"
                inputMode="decimal"
              />
            </label>
          ))}
        </div>

        <label className="input-group">
          <span className="input-label">Description (optional)</span>
          <input className="input" value={description} onChange={(event) => onDescriptionChange(event.target.value)} placeholder="Any notes for this non-body item" />
        </label>
      </article>
    </div>
  )
}
