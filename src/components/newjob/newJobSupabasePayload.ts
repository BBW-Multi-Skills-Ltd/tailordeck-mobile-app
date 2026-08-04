import type { CreateFullJobInput, CreateJobPersonInput, CreateJobReferencePhotoInput } from '../../services/jobService'
import type { JobStatus } from '../../types/job'
import { digitsOnly, numericValue } from './newJobConfig'
import { getReferencePhotoTargets } from './deadline/referencePhotoTargets'
import type { NewJobWizardDerivedModel } from './newJobWizardDerived'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

function moneyValue(value: string): number {
  return numericValue(digitsOnly(value))
}

function numberOrStringMeasurements(measurements: Record<string, string>): Record<string, number | string> {
  return Object.fromEntries(
    Object.entries(measurements)
      .filter(([, value]) => value !== '')
      .map(([field, value]) => {
        const trimmed = value.trim()
        const numeric = Number(trimmed)
        return [field, Number.isNaN(numeric) ? trimmed : numeric]
      }),
  )
}

function resolveClientSex(state: NewJobWizardStateModel): 'Male' | 'Female' {
  const firstSex = state.persons[0]?.sex
  return firstSex === 'Male' || firstSex === 'Boy' ? 'Male' : 'Female'
}

function buildBodyPersons(state: NewJobWizardStateModel): CreateJobPersonInput[] {
  const persons = state.persons.length ? state.persons : []
  return persons.map((person, index) => ({
    name: person.name || (index === 0 ? state.clientName : `Person ${index + 1}`),
    sex: person.sex,
    role: person.role,
    age: person.age || null,
    itemType: person.itemType || state.itemType || null,
    description: person.description || null,
    isPrimary: index === 0,
    measurementKind: 'body',
    quantity: null,
    measurements: numberOrStringMeasurements(person.measurements),
    measurementUnit: 'inches',
    sortOrder: index + 1,
  }))
}

function buildNonBodyPerson(state: NewJobWizardStateModel): CreateJobPersonInput {
  return {
    name: state.clientName,
    sex: resolveClientSex(state),
    role: 'adult',
    age: null,
    itemType: state.itemType || null,
    description: state.nonBodyDescription || null,
    isPrimary: true,
    measurementKind: 'non_body',
    quantity: state.nonBodyQuantity || null,
    measurements: numberOrStringMeasurements(state.nonBodyMeasurements),
    measurementUnit: 'inches',
    sortOrder: 1,
  }
}

function buildPersons(state: NewJobWizardStateModel): CreateJobPersonInput[] {
  if (state.makeCategory === 'Non-Body Item') return [buildNonBodyPerson(state)]
  const bodyPersons = buildBodyPersons(state)
  return bodyPersons.length ? bodyPersons : [buildNonBodyPerson(state)]
}

function buildReferencePhotos(state: NewJobWizardStateModel, derived: NewJobWizardDerivedModel): CreateJobReferencePhotoInput[] {
  const targets = getReferencePhotoTargets({
    clientName: state.clientName,
    effectiveItemType: derived.effectiveItemType,
    jobType: state.jobType,
    makeCategory: state.makeCategory,
    persons: state.persons,
    sameItemForAll: state.sameItemForAll,
  })
  const photos: CreateJobReferencePhotoInput[] = []

  targets.forEach((target) => {
    const targetFiles = state.referencePhotoFilesByTarget[target.id] ?? []
    targetFiles.slice(0, target.maxFiles).forEach((file) => {
      photos.push({
        file,
        sortOrder: photos.length + 1,
        targetId: target.id,
        targetLabel: target.label,
      })
    })
  })

  if (photos.length) return photos

  return state.referencePhotoFiles.map((file, index) => ({
    file,
    sortOrder: index + 1,
    targetId: null,
    targetLabel: null,
  }))
}

export function buildNewJobPayload(params: {
  state: NewJobWizardStateModel
  derived: NewJobWizardDerivedModel
  repeatClientId?: string | null
  status?: JobStatus
}): CreateFullJobInput {
  const { derived, repeatClientId, state, status = 'Pending' } = params
  const itemType = derived.effectiveItemType || state.amendmentIssueType || 'Tailoring job'

  return {
    clientId: repeatClientId || null,
    clientName: state.clientName,
    clientPhone: state.clientPhone,
    clientSex: resolveClientSex(state),
    title: itemType,
    orderMode: state.orderMode,
    makeCategory: state.makeCategory,
    orderScope: state.makeCategory === 'Body Wear' ? state.jobType : 'Single',
    sameItemForAll: state.sameItemForAll,
    itemType,
    description: state.orderMode === 'Amendment / Repair' ? state.amendmentDescription : state.nonBodyDescription || undefined,
    chargeAmount: derived.charge,
    depositPercent: derived.depositPercentValue,
    deadlineDate: state.deadlineDate,
    deadlineTime: state.deadlineTime,
    reminder: state.reminder || 'none',
    status,
    measurementUnit: 'inches',
    amendmentIssueType: state.amendmentIssueType,
    amendmentArea: state.amendmentArea,
    amendmentTarget: state.amendmentTarget,
    amendmentDescription: state.amendmentDescription,
    amendmentNeedsMaterials: state.amendmentNeedsMaterials,
    amendmentPartName: state.amendmentPartName,
    amendmentPartQuantity: state.amendmentPartQuantity,
    materialType: derived.showFullMaterialFlow || derived.showAmendmentMaterialFlow ? derived.selectedMaterialValue : undefined,
    materialColor: derived.showFullMaterialFlow || derived.showAmendmentMaterialFlow ? state.materialColor : undefined,
    materialYards: derived.showFullMaterialFlow || derived.showAmendmentMaterialFlow ? numericValue(digitsOnly(state.materialYards)) || null : null,
    materialQuality: derived.showFullMaterialFlow || derived.showAmendmentMaterialFlow ? state.materialQuality : null,
    materialSource: derived.showFullMaterialFlow || derived.showAmendmentMaterialFlow ? state.materialSource : null,
    totalExpenses: derived.totalExpenses,
    projectedProfit: derived.projectedProfit,
    isWorthIt: state.worthIt === 'Yes',
    persons: buildPersons(state),
    expenses: state.expenses.map((expense) => ({ name: expense.name, cost: moneyValue(expense.cost) })),
    referencePhotos: buildReferencePhotos(state, derived),
  }
}
