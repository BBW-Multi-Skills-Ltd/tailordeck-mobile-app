import { ensurePersonsForJobType } from './newJobFlow'
import {
  newPerson,
  type JobType,
  type MakeCategory,
  type OrderMode,
  type PersonForm,
  type PersonSex,
} from './newJobConfig'
import type { StepOneActionParams } from './newJobStepOneActionTypes'

export function createStepOneActions({
  clientName,
  itemType,
  jobType,
  makeCategory,
  persons,
  sameItemForAll,
  setAmendmentArea,
  setAmendmentDescription,
  setAmendmentIssueType,
  setAmendmentNeedsMaterials,
  setAmendmentPartName,
  setAmendmentPartQuantity,
  setAmendmentTarget,
  setClientName,
  setItemType,
  setJobType,
  setMakeCategory,
  setNonBodyMeasurements,
  setOrderMode,
  setPersons,
  setSameItemForAll,
}: StepOneActionParams) {
  function handleClientNameChange(value: string): void {
    setClientName(value)
    setPersons((prev) => ensurePersonsForJobType(jobType, prev, value))
  }

  function handleJobTypeChange(nextType: JobType): void {
    setJobType(nextType)
    setPersons((prev) => ensurePersonsForJobType(nextType, prev, clientName))
  }

  function handleMakeCategoryChange(nextCategory: MakeCategory): void {
    setMakeCategory(nextCategory)
    setItemType('')

    if (nextCategory !== 'Body Wear') {
      setJobType('Single')
      return
    }

    setSameItemForAll(true)
    setJobType('Single')
    setPersons((prev) => ensurePersonsForJobType('Single', prev, clientName))
  }

  function handleOrderModeChange(nextMode: OrderMode): void {
    setOrderMode(nextMode)

    if (nextMode === 'Amendment / Repair') {
      setJobType('Single')
      setSameItemForAll(true)
      setPersons((prev) => ensurePersonsForJobType('Single', prev, clientName))
      return
    }

    setAmendmentIssueType('')
    setAmendmentArea('')
    setAmendmentTarget('')
    setAmendmentDescription('')
    setAmendmentNeedsMaterials(false)
    setAmendmentPartName('')
    setAmendmentPartQuantity('')
  }

  function updateNonBodyMeasurement(field: string, value: string): void {
    setNonBodyMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  function updatePerson(personId: string, updater: (person: PersonForm) => PersonForm): void {
    setPersons((prev) => prev.map((person) => (person.id === personId ? updater(person) : person)))
  }

  function updatePersonMeasurement(personId: string, field: string, value: string): void {
    updatePerson(personId, (person) => ({
      ...person,
      measurements: { ...person.measurements, [field]: value },
    }))
  }

  function updateSharedItemType(value: string): void {
    setItemType(value)
    if (!sameItemForAll || makeCategory !== 'Body Wear') return
    setPersons((prev) => prev.map((person) => ({ ...person, itemType: value })))
  }

  function handleSameItemToggle(enabled: boolean): void {
    setSameItemForAll(enabled)
    if (!enabled || makeCategory !== 'Body Wear') return

    const primaryItem = persons[0]?.itemType?.trim() || itemType.trim()
    if (!itemType.trim() && primaryItem) setItemType(primaryItem)
    setPersons((prev) => prev.map((person) => ({ ...person, itemType: primaryItem })))
  }

  function addChild(): void {
    const childCount = persons.filter((person) => person.role === 'child').length
    setPersons((prev) => [
      ...prev,
      newPerson({ name: `Child ${childCount + 1}`, sex: 'Boy', role: 'child', itemType: sameItemForAll ? itemType : '' }),
    ])
  }

  function addAdult(): void {
    const nextAdultNumber = persons.filter((person) => person.role === 'adult').length + 1
    const nextSex: PersonSex = nextAdultNumber % 2 === 0 ? 'Female' : 'Male'
    setPersons((prev) => [
      ...prev,
      newPerson({ name: `Adult ${nextAdultNumber}`, sex: nextSex, role: 'adult', itemType: sameItemForAll ? itemType : '' }),
    ])
  }

  return {
    addAdult,
    addChild,
    handleClientNameChange,
    handleJobTypeChange,
    handleMakeCategoryChange,
    handleOrderModeChange,
    handleSameItemToggle,
    updateNonBodyMeasurement,
    updatePerson,
    updatePersonMeasurement,
    updateSharedItemType,
  }
}
