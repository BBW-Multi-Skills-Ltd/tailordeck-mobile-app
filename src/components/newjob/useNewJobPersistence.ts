import { useNavigate } from 'react-router-dom'
import { useCreateFullJobMutation, useUpdateFullJobMutation } from '../../hooks/useJobQueries'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { buildNewJobPayload } from './newJobSupabasePayload'
import type { NewJobWizardDerivedModel } from './newJobWizardDerived'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

type UseNewJobPersistenceParams = {
  derived: NewJobWizardDerivedModel
  draftId: string | null
  repeatClientId: string | null
  state: NewJobWizardStateModel
}

export function useNewJobPersistence({ derived, draftId, repeatClientId, state }: UseNewJobPersistenceParams) {
  const navigate = useNavigate()
  const createFullJobMutation = useCreateFullJobMutation()
  const updateFullJobMutation = useUpdateFullJobMutation()

  async function handleFinalizeJob(): Promise<void> {
    state.setIsFinalizing(true)
    state.setDraftSaved(false)
    state.setWizardError('')

    try {
      const payload = buildNewJobPayload({ state, derived, repeatClientId })
      const existingDraftId = state.createdJobId || draftId
      const createdJob = existingDraftId
        ? await updateFullJobMutation.mutateAsync({ id: existingDraftId, input: payload })
        : await createFullJobMutation.mutateAsync(payload)
      state.setCreatedJobId(createdJob.id)
      state.setSuccessOpen(true)
    } catch (error) {
      state.setWizardError(getServiceErrorMessage(error, 'Unable to finalize this job.'))
    } finally {
      state.setIsFinalizing(false)
    }
  }

  async function handleSaveDraft(): Promise<void> {
    if (state.draftSaved) return
    state.setIsSavingDraft(true)
    state.setWizardError('')

    try {
      const payload = buildNewJobPayload({ state, derived, repeatClientId, status: 'Draft' })
      const existingDraftId = state.createdJobId || draftId
      const draftJob = existingDraftId
        ? await updateFullJobMutation.mutateAsync({ id: existingDraftId, input: payload })
        : await createFullJobMutation.mutateAsync(payload)
      state.setCreatedJobId(draftJob.id)
      state.setDraftSaved(true)
      navigate(`/jobs/${draftJob.id}`, { replace: true })
    } catch (error) {
      state.setWizardError(getServiceErrorMessage(error, 'Unable to save this draft.'))
    } finally {
      state.setIsSavingDraft(false)
    }
  }

  return { handleFinalizeJob, handleSaveDraft }
}
