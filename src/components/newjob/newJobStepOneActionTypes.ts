import type { Dispatch, SetStateAction } from 'react'
import type {
  JobType,
  MakeCategory,
  OrderMode,
  PersonForm,
} from './newJobConfig'

export type StepOneActionParams = {
  clientName: string
  itemType: string
  jobType: JobType
  makeCategory: MakeCategory
  persons: PersonForm[]
  sameItemForAll: boolean
  setAmendmentArea: (value: string) => void
  setAmendmentDescription: (value: string) => void
  setAmendmentIssueType: (value: string) => void
  setAmendmentNeedsMaterials: (value: boolean) => void
  setAmendmentPartName: (value: string) => void
  setAmendmentPartQuantity: (value: string) => void
  setAmendmentTarget: (value: string) => void
  setClientName: (value: string) => void
  setItemType: (value: string) => void
  setJobType: (value: JobType) => void
  setMakeCategory: (value: MakeCategory) => void
  setNonBodyMeasurements: Dispatch<SetStateAction<Record<string, string>>>
  setOrderMode: (value: OrderMode) => void
  setPersons: Dispatch<SetStateAction<PersonForm[]>>
  setSameItemForAll: (value: boolean) => void
}
