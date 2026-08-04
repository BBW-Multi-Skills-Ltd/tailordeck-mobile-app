import { isImageFile } from '../../lib/formValidation'
import { cleanClientPhoneInput, type NewJobFieldKey } from './newJobFieldValidation'
import type { createNewJobWizardActions } from './newJobWizardActions'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

type NewJobWizardActions = ReturnType<typeof createNewJobWizardActions>

type FieldAwareActionParams = {
  actions: NewJobWizardActions
  clearFieldError: (field: NewJobFieldKey) => void
  state: NewJobWizardStateModel
}

export function createFieldAwareNewJobActions({ actions, clearFieldError, state }: FieldAwareActionParams) {
  return {
    ...actions,
    handleClientNameChange: (value: string) => {
      clearFieldError('clientName')
      actions.handleClientNameChange(value)
    },
    setClientPhone: (value: string) => {
      clearFieldError('clientPhone')
      actions.setClientPhone(cleanClientPhoneInput(value))
    },
    updateSharedItemType: (value: string) => {
      clearFieldError('itemType')
      actions.updateSharedItemType(value)
    },
    setAmendmentIssueType: (value: string) => {
      clearFieldError('amendmentIssueType')
      actions.setAmendmentIssueType(value)
    },
    setMaterialType: (value: string) => {
      clearFieldError('materialType')
      actions.setMaterialType(value)
    },
    setCustomMaterialType: (value: string) => {
      clearFieldError('customMaterialType')
      actions.setCustomMaterialType(value)
    },
    setMaterialColor: (value: string) => {
      clearFieldError('materialColor')
      actions.setMaterialColor(value)
    },
    setMaterialYards: (value: string) => {
      clearFieldError('materialYards')
      actions.setMaterialYards(value)
    },
    setAmendmentPartName: (value: string) => {
      clearFieldError('amendmentPartName')
      actions.setAmendmentPartName(value)
    },
    setAmendmentPartQuantity: (value: string) => {
      clearFieldError('amendmentPartQuantity')
      actions.setAmendmentPartQuantity(value)
    },
    setChargeAmount: (value: string) => {
      clearFieldError('chargeAmount')
      actions.setChargeAmount(value)
    },
    setDepositPercent: (value: string) => {
      clearFieldError('depositPercent')
      actions.setDepositPercent(value)
    },
    setDeadlineDate: (value: string) => {
      clearFieldError('deadlineDate')
      actions.setDeadlineDate(value)
    },
    setDeadlineTime: (value: string) => {
      clearFieldError('deadlineTime')
      actions.setDeadlineTime(value)
    },
    setReminder: (value: Parameters<typeof actions.setReminder>[0]) => {
      clearFieldError('reminder')
      actions.setReminder(value)
    },
    handleReferencePhotoUpload: (targetId: string, files: FileList | null, maxFiles?: number) => {
      const incomingFiles = files ? Array.from(files) : []
      if (incomingFiles.some((file) => !isImageFile(file))) {
        state.setFieldErrorKey((current) => current + 1)
      }
      clearFieldError('referencePhotos')
      actions.handleReferencePhotoUpload(targetId, files, maxFiles)
    },
  }
}
