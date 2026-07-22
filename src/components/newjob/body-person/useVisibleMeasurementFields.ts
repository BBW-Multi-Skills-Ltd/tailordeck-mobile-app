import { useMemo, useState } from 'react'
import { toMeasurementSex } from '../body-measurements/bodyMeasurementSex'
import { commonFieldsBySex, type PersonForm } from '../newJobConfig'

export function useVisibleMeasurementFields({
  measurementFields,
  person,
}: {
  measurementFields: string[]
  person: PersonForm
}) {
  const measurementFieldKey = measurementFields.join('|')
  const defaultVisibleFields = useMemo(
    () => commonFieldsBySex(toMeasurementSex(person.sex)).filter((field) => measurementFields.includes(field)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measurementFieldKey, person.sex],
  )
  const sourceKey = `${person.id}:${person.sex}:${measurementFieldKey}`
  const [visibleState, setVisibleState] = useState(() => ({ fields: defaultVisibleFields, sourceKey }))
  const [customFieldName, setCustomFieldName] = useState('')
  const [showAddMeasurements, setShowAddMeasurements] = useState(false)
  const visibleFields = visibleState.sourceKey === sourceKey ? visibleState.fields : defaultVisibleFields
  const hiddenFields = measurementFields.filter((field) => !visibleFields.includes(field))

  function setCurrentVisibleFields(updater: (fields: string[]) => string[]): void {
    setVisibleState((currentState) => {
      const currentFields = currentState.sourceKey === sourceKey ? currentState.fields : defaultVisibleFields
      return { fields: updater(currentFields), sourceKey }
    })
  }

  function addMeasurementField(field: string): void {
    setCurrentVisibleFields((current) => (current.includes(field) ? current : [...current, field]))
  }

  function removeMeasurementField(field: string): void {
    setCurrentVisibleFields((current) => current.filter((item) => item !== field))
    setShowAddMeasurements(true)
  }

  function addCustomMeasurement(): void {
    const normalized = customFieldName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    if (!normalized) return
    addMeasurementField(normalized)
    setCustomFieldName('')
  }

  return {
    addCustomMeasurement,
    addMeasurementField,
    customFieldName,
    hiddenFields,
    removeMeasurementField,
    setCustomFieldName,
    setShowAddMeasurements,
    showAddMeasurements,
    visibleFields,
  }
}
