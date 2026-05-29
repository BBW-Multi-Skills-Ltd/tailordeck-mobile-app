import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useClients } from '../hooks/useClients'
import type { FormEvent } from 'react'
import type { ClientMeasurements, ClientSex, MeasurementUnit } from '../types/client'

type MeasurementField = keyof ClientMeasurements

const measurementFields: MeasurementField[] = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'thigh', 'inseam', 'ankle', 'neck']

const fieldLabels: Record<MeasurementField, string> = {
  chest: 'Chest',
  bust: 'Bust',
  waist: 'Waist',
  shoulder: 'Shoulder',
  hip: 'Hip',
  inseam: 'Inseam',
  sleeve: 'Sleeve',
  neck: 'Neck',
  thigh: 'Thigh',
  ankle: 'Ankle',
  head: 'Head',
}

function buildMeasurements(values: Record<MeasurementField, string>): ClientMeasurements {
  return measurementFields.reduce<ClientMeasurements>((acc, field) => {
    const raw = values[field]
    const numeric = Number(raw)
    if (raw && !Number.isNaN(numeric) && numeric > 0) {
      acc[field] = numeric
    }
    return acc
  }, {})
}

export default function NewClient() {
  const { addClient } = useClients()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sex, setSex] = useState<ClientSex>('Female')
  const [unit, setUnit] = useState<MeasurementUnit>('cm')
  const [error, setError] = useState<string | null>(null)
  const [measurements, setMeasurements] = useState<Record<MeasurementField, string>>({
    chest: '',
    bust: '',
    waist: '',
    shoulder: '',
    hip: '',
    inseam: '',
    sleeve: '',
    neck: '',
    thigh: '',
    ankle: '',
    head: '',
  })

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
      measurements: buildMeasurements(measurements),
    })

    navigate(`/clients/${created.id}`)
  }

  return (
    <section className="section stack gap-16">
      <div className="row-between">
        <Link to="/clients" className="btn btn-ghost btn-icon" aria-label="Back to clients">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="app-page-heading">New Client</h2>
        <span style={{ width: '44px' }} />
      </div>

      <form className="stack gap-12" onSubmit={handleSubmit}>
        <label className="input-group">
          <span className="input-label">Full Name</span>
          <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Client full name" />
        </label>

        <label className="input-group">
          <span className="input-label">Phone Number</span>
          <input
            className="input"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="08012345678"
            inputMode="tel"
          />
        </label>

        <div className="input-group">
          <span className="input-label">Sex</span>
          <div className="pill-group">
            {(['Female', 'Male'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`pill${sex === value ? ' active' : ''}`}
                onClick={() => setSex(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <span className="input-label">Measurement Unit</span>
          <div className="pill-group">
            {(['cm', 'inches'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`pill${unit === value ? ' active' : ''}`}
                onClick={() => setUnit(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="card stack gap-12">
          <h4>{formTitle}</h4>
          <div className="stack gap-10">
            {measurementFields.map((field) => (
              <label key={field} className="input-group">
                <span className="input-label">{fieldLabels[field]}</span>
                <input
                  className="input"
                  value={measurements[field]}
                  onChange={(event) => updateMeasurement(field, event.target.value)}
                  inputMode="decimal"
                  placeholder={`Enter ${fieldLabels[field].toLowerCase()} (${unit})`}
                />
              </label>
            ))}
          </div>
        </div>

        {error ? (
          <p className="text-sm" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary btn-full">
          Save Client
        </button>
      </form>
    </section>
  )
}
