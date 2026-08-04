import { isImageFile, isValidNigerianMobileLocal, localNigerianPhone, type FieldErrors } from '../../lib/formValidation'
import type { NewJobWizardDerivedModel } from './newJobWizardDerived'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

export type NewJobFieldKey =
  | 'clientName'
  | 'clientPhone'
  | 'itemType'
  | 'amendmentIssueType'
  | 'materialType'
  | 'customMaterialType'
  | 'materialColor'
  | 'materialYards'
  | 'amendmentPartName'
  | 'amendmentPartQuantity'
  | 'chargeAmount'
  | 'depositPercent'
  | 'deadlineDate'
  | 'deadlineTime'
  | 'reminder'
  | 'referencePhotos'

export type NewJobFieldErrors = FieldErrors<NewJobFieldKey>

function hasText(value: string): boolean {
  return value.trim().length > 0
}

function validateClientStep(state: NewJobWizardStateModel, derived: NewJobWizardDerivedModel): NewJobFieldErrors {
  const errors: NewJobFieldErrors = {}

  if (!hasText(state.clientName)) errors.clientName = 'Enter client name.'
  if (!hasText(state.clientPhone)) errors.clientPhone = 'Enter WhatsApp number.'
  else if (!isValidNigerianMobileLocal(state.clientPhone)) errors.clientPhone = 'Enter a valid Nigerian number.'

  if (!derived.effectiveItemType) {
    if (derived.isAmendmentMode) errors.amendmentIssueType = 'Enter repair details.'
    else errors.itemType = 'Enter what you are making.'
  }

  return errors
}

function validateMaterialStep(state: NewJobWizardStateModel, derived: NewJobWizardDerivedModel): NewJobFieldErrors {
  const errors: NewJobFieldErrors = {}

  if (derived.showFullMaterialFlow) {
    if (!hasText(derived.selectedMaterialValue)) errors.materialType = 'Choose material.'
    if (state.materialType === 'Other Material' && !hasText(state.customMaterialType)) errors.customMaterialType = 'Type material name.'
    if (!hasText(state.materialColor)) errors.materialColor = 'Choose material color.'
    if (!hasText(state.materialYards) || Number(state.materialYards) <= 0) errors.materialYards = 'Enter total yards.'
  }

  if (derived.showAmendmentMaterialFlow) {
    if (!hasText(state.amendmentPartName)) errors.amendmentPartName = 'Enter part name.'
    if (!hasText(state.amendmentPartQuantity) || Number(state.amendmentPartQuantity) <= 0) errors.amendmentPartQuantity = 'Enter quantity.'
  }

  return errors
}

function validateCostingStep(state: NewJobWizardStateModel, derived: NewJobWizardDerivedModel): NewJobFieldErrors {
  const errors: NewJobFieldErrors = {}

  if (derived.charge <= 0) errors.chargeAmount = 'Enter charge amount.'
  if (!hasText(state.depositPercent)) errors.depositPercent = 'Enter deposit percent.'
  else if (derived.depositPercentValue < 0 || derived.depositPercentValue > 100) errors.depositPercent = 'Use 0 to 100%.'

  return errors
}

function validateDeadlineStep(state: NewJobWizardStateModel): NewJobFieldErrors {
  const errors: NewJobFieldErrors = {}

  if (!hasText(state.deadlineDate)) errors.deadlineDate = 'Select delivery date.'
  if (!hasText(state.deadlineTime)) errors.deadlineTime = 'Select delivery time.'
  if (!state.reminder) errors.reminder = 'Choose reminder option.'

  const invalidPhoto = state.referencePhotoFiles.find((file) => !isImageFile(file))
  if (invalidPhoto) errors.referencePhotos = 'Upload image files only.'

  return errors
}

export function validateNewJobFields(params: {
  derived: NewJobWizardDerivedModel
  state: NewJobWizardStateModel
  step: number
}): NewJobFieldErrors {
  const { derived, state, step } = params

  if (step === 0) return validateClientStep(state, derived)
  if (step === 1) return validateMaterialStep(state, derived)
  if (step === 2) return validateCostingStep(state, derived)
  if (step === 3) return validateDeadlineStep(state)
  return {}
}

export function hasNewJobErrors(errors: NewJobFieldErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export function cleanClientPhoneInput(value: string): string {
  return localNigerianPhone(value)
}
