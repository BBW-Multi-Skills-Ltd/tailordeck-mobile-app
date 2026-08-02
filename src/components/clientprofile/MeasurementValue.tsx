import { labelFromField } from '../../types/measurements'

type MeasurementValueProps = {
  editing: boolean
  field: string
  onChange: (value: string) => void
  unit: string
  value: number
}

export function MeasurementValue({ editing, field, onChange, unit, value }: MeasurementValueProps) {
  return (
    <div className="client-measure-item">
      <p className="text-sm text-muted">
        {labelFromField(field)} ({unit})
      </p>
      {editing ? (
        <input className="input client-measure-input" value={String(value)} onChange={(event) => onChange(event.target.value)} inputMode="decimal" />
      ) : (
        <p className="client-measure-value">{value}</p>
      )}
    </div>
  )
}
