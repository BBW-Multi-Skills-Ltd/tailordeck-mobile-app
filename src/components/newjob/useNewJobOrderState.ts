import { useState } from 'react'
import {
  newPerson,
  type JobType,
  type MakeCategory,
  type OrderMode,
  type PersonForm,
} from './newJobConfig'

export function useNewJobOrderState() {
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [orderMode, setOrderMode] = useState<OrderMode>('New Stitch')
  const [makeCategory, setMakeCategory] = useState<MakeCategory>('Body Wear')
  const [itemType, setItemType] = useState('')
  const [sameItemForAll, setSameItemForAll] = useState(true)
  const [jobType, setJobType] = useState<JobType>('Single')
  const [persons, setPersons] = useState<PersonForm[]>([newPerson({ sex: 'Female', role: 'adult' })])
  const [nonBodyMeasurements, setNonBodyMeasurements] = useState<Record<string, string>>({})
  const [nonBodyQuantity, setNonBodyQuantity] = useState('1')
  const [nonBodyDescription, setNonBodyDescription] = useState('')

  return {
    clientName,
    clientPhone,
    itemType,
    jobType,
    makeCategory,
    nonBodyDescription,
    nonBodyMeasurements,
    nonBodyQuantity,
    orderMode,
    persons,
    sameItemForAll,
    setClientName,
    setClientPhone,
    setItemType,
    setJobType,
    setMakeCategory,
    setNonBodyDescription,
    setNonBodyMeasurements,
    setNonBodyQuantity,
    setOrderMode,
    setPersons,
    setSameItemForAll,
  }
}
