import { toNaira } from '../../lib/money'
import type { JobWithRelations } from '../../services/types'
import { newPerson, type ExpenseForm, type PersonForm } from './newJobConfig'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

function moneyInput(kobo: number | null | undefined): string {
  const naira = toNaira(kobo ?? 0)
  return naira > 0 ? String(Math.round(naira)) : ''
}

function measurementInputs(measurements: Record<string, number | string> | null | undefined): Record<string, string> {
  return Object.fromEntries(Object.entries(measurements ?? {}).map(([key, value]) => [key, String(value)]))
}

function mapPersons(job: JobWithRelations): PersonForm[] {
  const persons = (job.job_persons ?? []).sort((a, b) => a.sort_order - b.sort_order)
  if (!persons.length) return [newPerson({ name: job.client_name, sex: 'Female', role: 'adult' })]

  return persons.map((person) =>
    newPerson({
      id: person.id,
      age: person.age ?? '',
      description: person.description ?? '',
      itemType: person.item_type ?? '',
      measurements: measurementInputs(person.measurements),
      name: person.person_name || person.name || '',
      role: person.role,
      sex: person.sex,
    }),
  )
}

function mapExpenses(job: JobWithRelations): ExpenseForm[] {
  return (job.job_expenses ?? []).map((expense) => ({
    id: expense.id,
    name: expense.name,
    cost: moneyInput(expense.cost_amount_kobo),
  }))
}

export function applyDraftToNewJobState(job: JobWithRelations, state: NewJobWizardStateModel): void {
  state.setCreatedJobId(job.id)
  state.setClientName(job.client_name)
  state.setClientPhone(job.client_phone ?? '')
  state.setOrderMode(job.order_mode)
  state.setMakeCategory(job.make_category)
  state.setJobType(job.order_scope)
  state.setSameItemForAll(job.same_item_for_all ?? true)
  state.setItemType(job.item_type ?? job.title ?? '')
  state.setPersons(mapPersons(job))
  state.setNonBodyDescription(job.description ?? '')
  state.setNonBodyQuantity(job.job_persons?.[0]?.quantity ? String(job.job_persons[0].quantity) : '1')
  state.setNonBodyMeasurements(measurementInputs(job.job_persons?.[0]?.measurements))
  state.setAmendmentIssueType(job.amendment_issue_type ?? '')
  state.setAmendmentArea(job.amendment_area ?? '')
  state.setAmendmentTarget(job.amendment_target ?? '')
  state.setAmendmentDescription(job.amendment_description ?? '')
  state.setAmendmentNeedsMaterials(job.amendment_needs_materials ?? false)
  state.setAmendmentPartName(job.amendment_part_name ?? '')
  state.setAmendmentPartQuantity(job.amendment_part_quantity ?? '')
  state.setMaterialType(job.material_type ?? '')
  state.setCustomMaterialType('')
  state.setMaterialColor(job.material_color ?? '')
  state.setMaterialYards(job.material_yards ? String(job.material_yards) : '')
  state.setMaterialQuality(job.material_quality ?? 'Normal')
  state.setMaterialSource(job.material_source ?? 'Client is Providing Material')
  state.setChargeAmount(moneyInput(job.charge_amount_kobo))
  state.setDepositPercent(job.deposit_percent ? String(job.deposit_percent) : '')
  state.setExpenses(mapExpenses(job))
  state.setWorthIt(job.is_worth_it === false ? 'No' : 'Yes')
  state.setDeadlineDate(job.deadline_date ?? '')
  state.setDeadlineTime(job.deadline_time?.slice(0, 5) ?? '')
  state.setReminder(job.reminder)
  state.setDraftSaved(false)
  state.setStepFourReviewMode(false)
  state.setStep(0)
}
