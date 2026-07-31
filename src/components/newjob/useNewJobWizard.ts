import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClientQuery } from '../../hooks/useClientQueries'
import { useCreateFullJobMutation } from '../../hooks/useJobQueries'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { useAppFeedback } from '../shared/appFeedbackCore'
import { cleanClientPhoneInput, hasNewJobErrors, type NewJobFieldKey, validateNewJobFields } from './newJobFieldValidation'
import { createNewJobWizardActions } from './newJobWizardActions'
import { getNewJobWizardDerived } from './newJobWizardDerived'
import { getNewJobWizardStateSnapshot } from './newJobWizardStateSnapshot'
import { buildNewJobPayload } from './newJobSupabasePayload'
import { validateNewJobStep } from './newJobStepValidation'
import { usePageNoScroll, useSharedItemTypeSync } from './useNewJobEffects'
import { useRepeatClientPrefill } from './useRepeatClientPrefill'
import { useNewJobWizardState } from './useNewJobWizardState'

export function useNewJobWizard() {
  const navigate = useNavigate()
  const feedback = useAppFeedback()
  const [searchParams] = useSearchParams()
  const sectionRef = useRef<HTMLElement | null>(null)
  const state = useNewJobWizardState()
  const repeatClientId = searchParams.get('clientId')
  const repeatClientQuery = useClientQuery(repeatClientId ?? undefined)
  const createFullJobMutation = useCreateFullJobMutation()
  const derived = getNewJobWizardDerived(state)
  const repeatClient = repeatClientQuery.data ?? undefined

  function clearFieldError(field: NewJobFieldKey): void {
    state.setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function validateCurrentStep(): boolean {
    const fieldErrors = validateNewJobFields({ derived, state, step: state.step })
    state.setFieldErrors(fieldErrors)
    if (hasNewJobErrors(fieldErrors)) return false

    const result = validateNewJobStep({ derived, repeatClientId, state, step: state.step })
    if (result.ok) return true
    feedback.toast(result.message, 'error')
    return false
  }

  useRepeatClientPrefill(repeatClient, {
    setClientName: state.setClientName,
    setClientPhone: state.setClientPhone,
    setOrderMode: state.setOrderMode,
    setMakeCategory: state.setMakeCategory,
    setJobType: state.setJobType,
    setItemType: state.setItemType,
    setSameItemForAll: state.setSameItemForAll,
    setPersons: state.setPersons,
    setNonBodyMeasurements: state.setNonBodyMeasurements,
    setNonBodyQuantity: state.setNonBodyQuantity,
    setNonBodyDescription: state.setNonBodyDescription,
    setSingleMeasurementsOpen: state.setSingleMeasurementsOpen,
    setStepOneMeasurementsOpen: state.setStepOneMeasurementsOpen,
  })
  usePageNoScroll(state.successOpen)
  useSharedItemTypeSync({ makeCategory: state.makeCategory, sameItemForAll: state.sameItemForAll, itemType: state.itemType, setPersons: state.setPersons })

  async function handleFinalizeJob(): Promise<void> {
    state.setIsFinalizing(true)
    state.setDraftSaved(false)

    try {
      const createdJob = await createFullJobMutation.mutateAsync(buildNewJobPayload({ state, derived, repeatClientId }))
      state.setCreatedJobId(createdJob.id)
      state.setSuccessOpen(true)
    } catch (error) {
      feedback.toast(getServiceErrorMessage(error, 'Unable to finalize this job.'), 'error')
    } finally {
      state.setIsFinalizing(false)
    }
  }

  async function handleSaveDraft(): Promise<void> {
    if (state.draftSaved) return
    state.setIsSavingDraft(true)

    try {
      const draftJob = await createFullJobMutation.mutateAsync(buildNewJobPayload({ state, derived, repeatClientId, status: 'Draft' }))
      state.setCreatedJobId(draftJob.id)
      state.setDraftSaved(true)
      feedback.toast('Draft saved.', 'success')
    } catch (error) {
      feedback.toast(getServiceErrorMessage(error, 'Unable to save this draft.'), 'error')
    } finally {
      state.setIsSavingDraft(false)
    }
  }

  const actions = createNewJobWizardActions({
    confirmDiscard: () =>
      feedback.confirm({
        title: 'Discard this job?',
        message: 'This will remove the current job draft and return to Jobs.',
        confirmLabel: 'Discard',
        tone: 'danger',
      }),
    navigate,
    state,
    validateCurrentStep,
  })

  const fieldAwareActions = {
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
    handleReferencePhotoUpload: (targetId: string, files: FileList | null, maxFiles?: number) => {
      clearFieldError('referencePhotos')
      actions.handleReferencePhotoUpload(targetId, files, maxFiles)
    },
  }

  return {
    actions: {
      ...fieldAwareActions,
      handleFinalizeJob,
      proceedToReview: () => {
        if (!validateCurrentStep()) return
        state.setStepFourReviewMode(true)
      },
      saveDraft: handleSaveDraft,
      viewCreatedJob: () => navigate(state.createdJobId ? `/jobs/${state.createdJobId}` : '/jobs'),
    },
    derived,
    repeatClient: Boolean(repeatClient),
    sectionRef,
    state: getNewJobWizardStateSnapshot(state),
  }
}

export type NewJobWizardModel = ReturnType<typeof useNewJobWizard>
