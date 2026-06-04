import type { ClientMeasurements } from '../../types/client'

export type MeasurementField = keyof ClientMeasurements

export const newClientMeasurementFields: MeasurementField[] = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'thigh', 'inseam', 'ankle', 'neck']

export const newClientFieldLabels: Record<MeasurementField, string> = {
  ankle: 'Ankle',
  bust: 'Bust',
  chest: 'Chest',
  head: 'Head',
  hip: 'Hip',
  inseam: 'Inseam',
  neck: 'Neck',
  shoulder: 'Shoulder',
  sleeve: 'Sleeve',
  thigh: 'Thigh',
  waist: 'Waist',
}

export const emptyNewClientMeasurements: Record<MeasurementField, string> = {
  ankle: '',
  bust: '',
  chest: '',
  head: '',
  hip: '',
  inseam: '',
  neck: '',
  shoulder: '',
  sleeve: '',
  thigh: '',
  waist: '',
}

export function buildClientMeasurements(values: Record<MeasurementField, string>): ClientMeasurements {
  return newClientMeasurementFields.reduce<ClientMeasurements>((acc, field) => {
    const raw = values[field]
    const numeric = Number(raw)
    if (raw && !Number.isNaN(numeric) && numeric > 0) acc[field] = numeric
    return acc
  }, {})
}
