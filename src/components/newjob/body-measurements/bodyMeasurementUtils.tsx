import type { PersonSex } from '../newJobConfig'

export function MeasurementSectionIntro() {
  return (
    <div className="wizard-measurement-intro">
      <p className="input-label">Measurements</p>
      <p>Fill only needed fields. Add or remove measurements.</p>
    </div>
  )
}

export function toMeasurementSex(sex: PersonSex): PersonSex {
  if (sex === 'Girl') return 'Female'
  if (sex === 'Boy') return 'Male'
  return sex
}
