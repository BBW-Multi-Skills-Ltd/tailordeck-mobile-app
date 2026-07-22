import { useEffect, useMemo, useState } from 'react'
import { commonFieldsBySex, type PersonForm, type PersonSex } from '../newJobConfig'

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
  const [visibleFields, setVisibleFields] = useState<string[]>(defaultVisibleFields)
  const [customFieldName, setCustomFieldName] = useState('')
  const [showAddMeasurements, setShowAddMeasurements] = useState(false)
  const hiddenFields = measurementFields.filter((field) => !visibleFields.includes(field))

  useEffect(() => {
    setVisibleFields(defaultVisibleFields)
  }, [defaultVisibleFields, person.id])

  function addMeasurementField(field: string): void {
    setVisibleFields((current) => (current.includes(field) ? current : [...current, field]))
  }

  function removeMeasurementField(field: string): void {
    setVisibleFields((current) => current.filter((item) => item !== field))
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

function toMeasurementSex(sex: PersonSex): PersonSex {
  if (sex === 'Girl') return 'Female'
  if (sex === 'Boy') return 'Male'
  return sex
}
