import type { PersonSex } from './newJobTypes'

const STEP1_MALE_FIELDS = [
  'chest',
  'waist',
  'shoulder',
  'sleeve',
  'neck',
  'head',
  'hip',
  'thigh',
  'inseam',
  'ankle',
  'knee',
  'wrist',
  'shorts',
  'outseam',
  'bicep',
  'butt_seat',
  'top_length',
  'floor_length',
  'height',
]

const STEP1_FEMALE_FIELDS = [
  'bust',
  'waist',
  'full_hip',
  'shoulder',
  'sleeve',
  'neck',
  'head',
  'height',
  'overbust',
  'underbust',
  'hip',
  'thigh',
  'knee',
  'calf',
  'ankle',
  'nltc',
  'stw',
  'wthb',
  'inseam',
  'nltb',
  'sthb',
  'hth',
  'outseam',
  'bicep',
  'wrist',
]

export const COMMON_MALE_FIELDS = STEP1_MALE_FIELDS.slice(0, 8)
export const COMMON_FEMALE_FIELDS = STEP1_FEMALE_FIELDS.slice(0, 8)

export const CHILD_FIELDS = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'inseam', 'ankle']
export const COMMON_CHILD_FIELDS = CHILD_FIELDS.slice(0, 5)

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

export function commonFieldsBySex(sex: PersonSex): string[] {
  if (sex === 'Female') return COMMON_FEMALE_FIELDS
  if (sex === 'Boy' || sex === 'Girl') return COMMON_CHILD_FIELDS
  return COMMON_MALE_FIELDS
}

export function measurementNumbersToStrings(measurements: Record<string, number>): Record<string, string> {
  return Object.fromEntries(Object.entries(measurements).map(([field, value]) => [field, String(value)]))
}
