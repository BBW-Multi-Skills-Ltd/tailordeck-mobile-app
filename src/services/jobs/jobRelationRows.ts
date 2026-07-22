import { toKobo } from '../../lib/money'
import type { CreateFullJobInput } from './jobServiceTypes'

export function buildJobPersonRows(input: CreateFullJobInput, userId: string, jobId: string, clientId: string | null) {
  return input.persons.map((person) => ({
    user_id: userId,
    job_id: jobId,
    client_id: clientId,
    name: person.name.trim() || input.clientName.trim(),
    person_name: person.name.trim() || input.clientName.trim(),
    sex: person.sex,
    role: person.role,
    age: person.age?.trim() || null,
    item_type: person.itemType?.trim() || input.itemType.trim() || null,
    description: person.description?.trim() || null,
    is_primary: person.isPrimary,
    measurement_kind: person.measurementKind,
    quantity: person.quantity?.trim() || '1',
    measurements: person.measurements,
    measurement_unit: person.measurementUnit,
    sort_order: person.sortOrder,
  }))
}

export function buildJobExpenseRows(input: CreateFullJobInput, userId: string, jobId: string) {
  return input.expenses
    .filter((expense) => expense.name.trim())
    .map((expense) => ({
      user_id: userId,
      job_id: jobId,
      name: expense.name.trim(),
      cost_amount_kobo: toKobo(expense.cost),
    }))
}
