import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClientQuery } from '../../hooks/useClientQueries'
import { useJobQuery } from '../../hooks/useJobQueries'
import { useAppFeedback } from '../shared/appFeedbackCore'
import { hasNewJobErrors, type NewJobFieldKey, validateNewJobFields } from './newJobFieldValidation'
import { createFieldAwareNewJobActions } from './newJobFieldAwareActions'
import { createNewJobWizardActions } from './newJobWizardActions'
import { applyDraftToNewJobState } from './newJobDraftMapper'
import { getNewJobWizardDerived } from './newJobWizardDerived'
import { getNewJobWizardStateSnapshot } from './newJobWizardStateSnapshot'
import { validateNewJobStep } from './newJobStepValidation'
import { usePageNoScroll, useSharedItemTypeSync } from './useNewJobEffects'
import { useNewJobPersistence } from './useNewJobPersistence'
import { useRepeatClientPrefill } from './useRepeatClientPrefill'
import { useNewJobWizardState } from './useNewJobWizardState'

function scrollFirstWizardErrorIntoView(): void {
  window.setTimeout(() => {
    const firstError = document.querySelector('.wizard-page .input-invalid, .wizard-page .input-error-text')
    if (!firstError) return
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 80)
}

export function useNewJobWizard() {
  const navigate = useNavigate()
  const feedback = useAppFeedback()
  const [searchParams] = useSearchParams()
  const sectionRef = useRef<HTMLElement | null>(null)
  const appliedDraftIdRef = useRef('')
  const state = useNewJobWizardState()
  const repeatClientId = searchParams.get('clientId')
  const draftId = searchParams.get('draftId')
  const repeatClientQuery = useClientQuery(repeatClientId ?? undefined)
  const draftQuery = useJobQuery(draftId ?? undefined)
  const derived = getNewJobWizardDerived(state)
  const repeatClient = repeatClientQuery.data ?? undefined
  const { handleFinalizeJob, handleSaveDraft } = useNewJobPersistence({ derived, draftId, repeatClientId, state })

  function clearFieldError(field: NewJobFieldKey): void {
    state.setWizardError('')
    state.setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function validateCurrentStep(): boolean {
    state.setWizardError('')
    const fieldErrors = validateNewJobFields({ derived, state, step: state.step })
    state.setFieldErrors(fieldErrors)
    if (hasNewJobErrors(fieldErrors)) {
      state.setFieldErrorKey((current) => current + 1)
      scrollFirstWizardErrorIntoView()
      return false
    }

    const result = validateNewJobStep({ derived, repeatClientId, state, step: state.step })
    if (result.ok) return true
    state.setFieldErrorKey((current) => current + 1)
    scrollFirstWizardErrorIntoView()
    state.setWizardError(result.message)
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

  useEffect(() => {
    if (!draftQuery.data || draftQuery.data.status !== 'draft' || appliedDraftIdRef.current === draftQuery.data.id) return
    applyDraftToNewJobState(draftQuery.data, state)
    appliedDraftIdRef.current = draftQuery.data.id
  }, [draftQuery.data, state])

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
  const fieldAwareActions = createFieldAwareNewJobActions({ actions, clearFieldError, state })

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
