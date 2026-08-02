import type { JobPersonRow } from '../../services/types'

export function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function normalizeMeasurementValue(value: number | string): string {
  return String(value ?? '')
}

export function getPersonName(person: JobPersonRow): string {
  return person.name?.trim() || person.person_name?.trim() || 'Client'
}

export function getDraftKey(personId: string, field: string): string {
  return `${personId}:${field}`
}
