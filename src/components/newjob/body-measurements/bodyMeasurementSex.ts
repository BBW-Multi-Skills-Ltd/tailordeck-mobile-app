import type { PersonSex } from '../newJobConfig'

export function toMeasurementSex(sex: PersonSex): PersonSex {
  if (sex === 'Girl') return 'Female'
  if (sex === 'Boy') return 'Male'
  return sex
}
