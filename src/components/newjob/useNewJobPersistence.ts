import { useNavigate } from 'react-router-dom'
import { useSaveFullJobMutation } from '../../hooks/useJobQueries'
import { clearNewJobAutosave } from './newJobAutosave'
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
  const saveFullJobMutation = useSaveFullJobMutation()

  function saveJob(status?: 'Draft') {
    // Editing a draft keeps its id; a new job uses the wizard's fixed id, so a retry never duplicates it.
    const jobId = state.createdJobId || draftId || state.pendingJobId
    const input = buildNewJobPayload({ state, derived, repeatClientId, ...(status ? { status } : {}) })
    return saveFullJobMutation.mutateAsync({ jobId, newClientId: state.pendingClientId, input })
  }

  async function handleFinalizeJob(): Promise<void> {
    state.setIsFinalizing(true)
    state.setDraftSaved(false)
    state.setWizardError('')

    try {
      const createdJob = await saveJob()
      state.setCreatedJobId(createdJob.id)
      clearNewJobAutosave()
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
      const draftJob = await saveJob('Draft')
      state.setCreatedJobId(draftJob.id)
      clearNewJobAutosave()
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
