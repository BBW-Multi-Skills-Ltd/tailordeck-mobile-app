import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import type { ClientSex, MeasurementUnit } from '../../types/client'
import { buildClientMeasurements, emptyNewClientMeasurements, type MeasurementField } from './newClientFormConfig'

export function useNewClientForm() {
  const { addClient } = useClients()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sex, setSex] = useState<ClientSex>('Female')
  const [unit, setUnit] = useState<MeasurementUnit>('cm')
  const [error, setError] = useState<string | null>(null)
  const [measurements, setMeasurements] = useState<Record<MeasurementField, string>>(emptyNewClientMeasurements)
  const formTitle = useMemo(() => (sex === 'Female' ? 'Female Measurements' : 'Male Measurements'), [sex])

  function updateMeasurement(field: MeasurementField, value: string): void {
    setMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedName || !trimmedPhone) {
      setError('Full name and phone number are required.')
      return
    }

    const created = addClient({
      name: trimmedName,
      phone: trimmedPhone,
      sex,
      measurement_unit: unit,
      measurements: buildClientMeasurements(measurements),
    })
    navigate(`/clients/${created.id}`)
  }

  return {
    error,
    formTitle,
    handleSubmit,
    measurements,
    name,
    phone,
    setName,
    setPhone,
    setSex,
    setUnit,
    sex,
    unit,
    updateMeasurement,
  }
}

export type NewClientFormModel = ReturnType<typeof useNewClientForm>
