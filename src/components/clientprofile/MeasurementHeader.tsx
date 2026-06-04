import { PencilLine, Ruler, Save } from 'lucide-react'

type MeasurementHeaderProps = {
  editing: boolean
  onToggle: () => void
  subtitle: string
}

export function MeasurementHeader({ editing, onToggle, subtitle }: MeasurementHeaderProps) {
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
