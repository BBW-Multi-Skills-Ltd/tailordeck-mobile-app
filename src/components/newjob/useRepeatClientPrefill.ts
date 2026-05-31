import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import type { Client } from '../../types/client'
import {
  measurementNumbersToStrings,
  newPerson,
  type JobType,
  type MakeCategory,
  type OrderMode,
  type PersonForm,
} from './newJobConfig'
import { latestMeasurementForClient, snapshotPersonsToForm } from './newJobFlow'

type RepeatClientPrefillSetters = {
  setClientName: Dispatch<SetStateAction<string>>
  setClientPhone: Dispatch<SetStateAction<string>>
  setOrderMode: Dispatch<SetStateAction<OrderMode>>
  setMakeCategory: Dispatch<SetStateAction<MakeCategory>>
  setJobType: Dispatch<SetStateAction<JobType>>
  setItemType: Dispatch<SetStateAction<string>>
  setSameItemForAll: Dispatch<SetStateAction<boolean>>
  setPersons: Dispatch<SetStateAction<PersonForm[]>>
  setNonBodyMeasurements: Dispatch<SetStateAction<Record<string, string>>>
  setNonBodyQuantity: Dispatch<SetStateAction<string>>
  setNonBodyDescription: Dispatch<SetStateAction<string>>
  setSingleMeasurementsOpen: Dispatch<SetStateAction<boolean>>
  setStepOneMeasurementsOpen: Dispatch<SetStateAction<Record<string, boolean>>>
}

export function useRepeatClientPrefill(repeatClient: Client | undefined, setters: RepeatClientPrefillSetters): void {
  const prefilledClientRef = useRef(false)

  useEffect(() => {
    if (!repeatClient || prefilledClientRef.current) return

    const latestSnapshot = latestMeasurementForClient(repeatClient.id)

    setters.setClientName(repeatClient.name)
    setters.setClientPhone(repeatClient.phone)
    setters.setOrderMode('New Stitch')

    if (latestSnapshot?.kind === 'body') {
      const nextPersons = snapshotPersonsToForm(latestSnapshot, repeatClient)
      const firstItem = nextPersons[0]?.itemType || latestSnapshot.itemType
      const everyPersonSameItem = nextPersons.every((person) => person.itemType === firstItem)

      setters.setMakeCategory('Body Wear')
      setters.setJobType(latestSnapshot.orderScope)
      setters.setItemType(everyPersonSameItem ? firstItem : latestSnapshot.itemType)
      setters.setSameItemForAll(everyPersonSameItem)
      setters.setPersons(nextPersons.length ? nextPersons : [newPerson({ name: repeatClient.name, sex: repeatClient.sex, role: 'adult' })])
      setters.setStepOneMeasurementsOpen(Object.fromEntries(nextPersons.map((person) => [person.id, true])))
      setters.setSingleMeasurementsOpen(true)
    } else if (latestSnapshot?.kind === 'non-body') {
      setters.setMakeCategory('Non-Body Item')
      setters.setJobType('Single')
      setters.setItemType(latestSnapshot.itemType)
      setters.setNonBodyQuantity(String(latestSnapshot.quantity))
      setters.setNonBodyDescription(latestSnapshot.description || '')
      setters.setNonBodyMeasurements(measurementNumbersToStrings(latestSnapshot.measurements))
      setters.setPersons([newPerson({ name: repeatClient.name, sex: repeatClient.sex, role: 'adult' })])
    } else {
      setters.setMakeCategory('Body Wear')
      setters.setJobType('Single')
      setters.setPersons([
        newPerson({
          name: repeatClient.name,
          sex: repeatClient.sex,
          role: 'adult',
          measurements: measurementNumbersToStrings({ ...repeatClient.measurements }),
        }),
      ])
      setters.setSingleMeasurementsOpen(true)
    }

    prefilledClientRef.current = true
  }, [repeatClient, setters])
}
