import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import { createNewJobWizardActions } from './newJobWizardActions'
import { getNewJobWizardDerived } from './newJobWizardDerived'
import { getNewJobWizardStateSnapshot } from './newJobWizardStateSnapshot'
import { usePageNoScroll, useSharedItemTypeSync } from './useNewJobEffects'
import { useRepeatClientPrefill } from './useRepeatClientPrefill'
import { useNewJobWizardState } from './useNewJobWizardState'

export function useNewJobWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getClientById } = useClients()
  const sectionRef = useRef<HTMLElement | null>(null)
  const state = useNewJobWizardState()
  const repeatClientId = searchParams.get('clientId')
  const repeatClient = repeatClientId ? getClientById(repeatClientId) : undefined

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

  return {
    actions: createNewJobWizardActions({ navigate, state }),
    derived: getNewJobWizardDerived(state),
    repeatClient: Boolean(repeatClient),
    sectionRef,
    state: getNewJobWizardStateSnapshot(state),
  }
}

export type NewJobWizardModel = ReturnType<typeof useNewJobWizard>
