import SegmentedControl from '../shared/SegmentedControl'
import { newClientFieldLabels, newClientMeasurementFields } from './newClientFormConfig'
import type { NewClientFormModel } from './useNewClientForm'

type NewClientFormProps = {
  form: NewClientFormModel
}

export function NewClientForm({ form }: NewClientFormProps) {
  return (
    <form className="stack gap-12" onSubmit={form.handleSubmit}>
      <label className="input-group">
        <span className="input-label">Full Name</span>
        <input className="input" value={form.name} onChange={(event) => form.setName(event.target.value)} placeholder="Client full name" />
      </label>

      <label className="input-group">
        <span className="input-label">Phone Number</span>
        <input className="input" value={form.phone} onChange={(event) => form.setPhone(event.target.value)} placeholder="08012345678" inputMode="tel" />
      </label>

      <PillChoice label="Sex" values={['Female', 'Male']} selected={form.sex} onSelect={form.setSex} />
      <PillChoice label="Measurement Unit" values={['cm', 'inches']} selected={form.unit} onSelect={form.setUnit} />

      <div className="card stack gap-12">
        <h4>{form.formTitle}</h4>
        <div className="stack gap-10">
          {newClientMeasurementFields.map((field) => (
            <label key={field} className="input-group">
              <span className="input-label">{newClientFieldLabels[field]}</span>
              <input
                className="input"
                value={form.measurements[field]}
                onChange={(event) => form.updateMeasurement(field, event.target.value)}
                inputMode="decimal"
                placeholder={`Enter ${newClientFieldLabels[field].toLowerCase()} (${form.unit})`}
              />
            </label>
          ))}
        </div>
      </div>

      {form.error ? <p className="text-sm" style={{ color: 'var(--danger)' }}>{form.error}</p> : null}
      <button type="submit" className="btn btn-primary btn-full">Save Client</button>
    </form>
  )
}

function PillChoice<T extends string>({ label, onSelect, selected, values }: { label: string; onSelect: (value: T) => void; selected: T; values: readonly T[] }) {
  return (
    <div className="input-group">
      <span className="input-label">{label}</span>
      <SegmentedControl label={label} options={values} value={selected} onChange={onSelect} />
    </div>
  )
}
