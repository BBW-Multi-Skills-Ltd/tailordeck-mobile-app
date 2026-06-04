import type { PersonSex } from './newJobTypes'

const STEP1_MALE_FIELDS = ['chest', 'waist', 'shoulder', 'hip', 'inseam', 'sleeve', 'neck', 'thigh']
const STEP1_FEMALE_FIELDS = ['chest', 'bust', 'waist', 'shoulder', 'hip', 'sleeve', 'neck', 'thigh']

export const CHILD_FIELDS = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'inseam', 'ankle']

export const nonBodyMeasurementTemplate: Record<string, string[]> = {
  Bedcover: ['length', 'width', 'drop'],
  Blanket: ['length', 'width'],
  Duvet: ['length', 'width'],
  'Pillow Case': ['length', 'width'],
  'Face Cap': ['head_circumference', 'crown_height', 'brim_length'],
  Other: ['length', 'width', 'height'],
}

export function step1FieldsBySex(sex: PersonSex): string[] {
  if (sex === 'Female') return STEP1_FEMALE_FIELDS
  return STEP1_MALE_FIELDS
}

export function measurementNumbersToStrings(measurements: Record<string, number>): Record<string, string> {
  return Object.fromEntries(Object.entries(measurements).map(([field, value]) => [field, String(value)]))
}

