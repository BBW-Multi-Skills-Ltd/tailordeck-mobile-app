import type { MeasurementUnit } from '../types/client'

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

export const jobMeasurementById: Record<string, JobMeasurementSnapshot> = {
  'j-001': {
    kind: 'body',
    orderScope: 'Single',
    unit: 'cm',
    itemType: 'Wedding Lace Gown',
    persons: [
      {
        id: 'j-001-p1',
        name: 'Adeola Johnson',
        sex: 'Female',
        role: 'adult',
        itemType: 'Wedding Lace Gown',
        description: 'Fitted with long sleeve and lined',
        measurements: { chest: 38, bust: 40, waist: 31, shoulder: 16, hip: 42, sleeve: 24, neck: 14, thigh: 24, ankle: 10, head: 22 },
      },
    ],
  },
  'j-002': {
    kind: 'body',
    orderScope: 'Single',
    unit: 'cm',
    itemType: 'Church Native Set',
    persons: [
      {
        id: 'j-002-p1',
        name: 'Adeola Johnson',
        sex: 'Female',
        role: 'adult',
        itemType: 'Church Native Set',
        measurements: { chest: 37, bust: 39, waist: 30, shoulder: 16, hip: 41, sleeve: 24, neck: 14, thigh: 24, ankle: 10, head: 22 },
      },
    ],
  },
  'j-003': {
    kind: 'body',
    orderScope: 'Couple',
    unit: 'inches',
    itemType: 'Senator Couple Set',
    persons: [
      {
        id: 'j-003-p1',
        name: 'Emeka Okafor',
        sex: 'Male',
        role: 'adult',
        itemType: 'Senator Suit',
        measurements: { chest: 42, waist: 35, shoulder: 18, hip: 40, inseam: 33, sleeve: 26, neck: 16, thigh: 24, ankle: 11, head: 23 },
      },
      {
        id: 'j-003-p2',
        name: 'Mariam Okafor',
        sex: 'Female',
        role: 'adult',
        itemType: 'Kaftan',
        measurements: { chest: 37, bust: 39, waist: 30, shoulder: 15, hip: 41, sleeve: 23, neck: 13, thigh: 23, ankle: 9, head: 21 },
      },
    ],
  },
  'j-004': {
    kind: 'body',
    orderScope: 'Couple',
    unit: 'inches',
    itemType: 'Agbada Set',
    persons: [
      {
        id: 'j-004-p1',
        name: 'Emeka Okafor',
        sex: 'Male',
        role: 'adult',
        itemType: 'Agbada Set',
        measurements: { chest: 42, waist: 35, shoulder: 18, hip: 40, inseam: 33, sleeve: 26, neck: 16, thigh: 24, ankle: 11, head: 23 },
      },
      {
        id: 'j-004-p2',
        name: 'Mariam Okafor',
        sex: 'Female',
        role: 'adult',
        itemType: 'Agbada Set',
        measurements: { chest: 37, bust: 39, waist: 30, shoulder: 15, hip: 41, sleeve: 23, neck: 13, thigh: 23, ankle: 9, head: 21 },
      },
    ],
  },
  'j-005': {
    kind: 'body',
    orderScope: 'Family',
    unit: 'cm',
    itemType: 'Aso-Ebi Family Pack',
    persons: [
      {
        id: 'j-005-p1',
        name: 'Chioma Okafor',
        sex: 'Female',
        role: 'adult',
        itemType: 'Family Gown',
        measurements: { chest: 38, bust: 40, waist: 31, shoulder: 16, hip: 42, sleeve: 24, neck: 14, thigh: 24, ankle: 10, head: 22 },
      },
      {
        id: 'j-005-p2',
        name: 'Chinedu Okafor',
        sex: 'Male',
        role: 'adult',
        itemType: 'Family Agbada',
        measurements: { chest: 43, waist: 36, shoulder: 19, hip: 41, inseam: 34, sleeve: 26, neck: 16, thigh: 24, ankle: 11, head: 24 },
      },
      {
        id: 'j-005-p3',
        name: 'Lara Okafor',
        sex: 'Girl',
        role: 'child',
        itemType: 'Family Dress',
        measurements: { chest: 29, waist: 25, shoulder: 12, hip: 30, inseam: 20, sleeve: 18, ankle: 8 },
      },
    ],
  },
  'j-006': {
    kind: 'body',
    orderScope: 'Family',
    unit: 'cm',
    itemType: 'Family Native Set',
    persons: [
      {
        id: 'j-006-p1',
        name: 'Chioma Okafor',
        sex: 'Female',
        role: 'adult',
        itemType: 'Native Blouse',
        measurements: { chest: 37, bust: 39, waist: 30, shoulder: 16, hip: 41, sleeve: 24, neck: 14, thigh: 23, ankle: 10, head: 22 },
      },
      {
        id: 'j-006-p2',
        name: 'Chinedu Okafor',
        sex: 'Male',
        role: 'adult',
        itemType: 'Native Top',
        measurements: { chest: 42, waist: 35, shoulder: 18, hip: 40, inseam: 33, sleeve: 26, neck: 16, thigh: 24, ankle: 11, head: 23 },
      },
      {
        id: 'j-006-p3',
        name: 'Tolu Okafor',
        sex: 'Boy',
        role: 'child',
        itemType: 'Native Child Set',
        measurements: { chest: 31, waist: 26, shoulder: 13, hip: 31, inseam: 21, sleeve: 19, ankle: 8 },
      },
    ],
  },
}

export function labelFromField(field: string): string {
  return field
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
