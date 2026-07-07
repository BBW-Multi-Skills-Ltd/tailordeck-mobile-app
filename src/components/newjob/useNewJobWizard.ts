import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClientQuery } from '../../hooks/useClientQueries'
import { useCreateFullJobMutation } from '../../hooks/useJobQueries'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { createNewJobWizardActions } from './newJobWizardActions'
import { getNewJobWizardDerived } from './newJobWizardDerived'
import { getNewJobWizardStateSnapshot } from './newJobWizardStateSnapshot'
import { buildNewJobPayload } from './newJobSupabasePayload'
import { usePageNoScroll, useSharedItemTypeSync } from './useNewJobEffects'
import { useRepeatClientPrefill } from './useRepeatClientPrefill'
import { useNewJobWizardState } from './useNewJobWizardState'

export function useNewJobWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sectionRef = useRef<HTMLElement | null>(null)
  const state = useNewJobWizardState()
  const repeatClientId = searchParams.get('clientId')
  const repeatClientQuery = useClientQuery(repeatClientId ?? undefined)
  const createFullJobMutation = useCreateFullJobMutation()
  const derived = getNewJobWizardDerived(state)
  const repeatClient = repeatClientQuery.data ?? undefined

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
      await createFullJobMutation.mutateAsync(buildNewJobPayload({ state, derived, repeatClientId }))
      state.setSuccessOpen(true)
    } catch (error) {
      window.alert(getServiceErrorMessage(error, 'Unable to finalize this job.'))
    } finally {
      state.setIsFinalizing(false)
    }
  }

  const actions = createNewJobWizardActions({ navigate, state })

  return {
    actions: { ...actions, handleFinalizeJob },
    derived,
    repeatClient: Boolean(repeatClient),
    sectionRef,
    state: getNewJobWizardStateSnapshot(state),
  }
}

export type NewJobWizardModel = ReturnType<typeof useNewJobWizard>
