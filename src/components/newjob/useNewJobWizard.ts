import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClientQuery } from '../../hooks/useClientQueries'
import { useCreateFullJobMutation } from '../../hooks/useJobQueries'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { useAppFeedback } from '../shared/appFeedbackCore'
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

  function validateCurrentStep(): boolean {
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

  return {
    actions: {
      ...actions,
      handleFinalizeJob,
      proceedToReview: () => {
        if (!validateCurrentStep()) return
        state.setStepFourReviewMode(true)
      },
      viewCreatedJob: () => navigate(state.createdJobId ? `/jobs/${state.createdJobId}` : '/jobs'),
    },
    derived,
    repeatClient: Boolean(repeatClient),
    sectionRef,
    state: getNewJobWizardStateSnapshot(state),
  }
}

export type NewJobWizardModel = ReturnType<typeof useNewJobWizard>
