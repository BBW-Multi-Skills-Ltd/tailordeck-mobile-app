import type { MeasurementUnit } from './client'

export type OrderScope = 'Single' | 'Couple' | 'Family'
export type PersonSex = 'Male' | 'Female' | 'Boy' | 'Girl'

export type BodyMeasurementSnapshot = {
  kind: 'body'
  orderScope: OrderScope
  unit: MeasurementUnit
  itemType: string
  persons: Array<{
    id: string
    name: string
    sex: PersonSex
    role: 'adult' | 'child'
    itemType?: string
    description?: string
    measurements: Record<string, number>
  }>
}

export type NonBodyMeasurementSnapshot = {
  kind: 'non-body'
  orderScope: 'Single'
  unit: MeasurementUnit
  itemType: string
  quantity: number
  description?: string
  measurements: Record<string, number>
}

export type JobMeasurementSnapshot = BodyMeasurementSnapshot | NonBodyMeasurementSnapshot

export function labelFromField(field: string): string {
  return field
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
