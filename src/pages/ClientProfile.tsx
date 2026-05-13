import { ArrowLeft, PencilLine, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { mockClientJobs } from '../data/mockJobs'
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

function formatDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusClass(status: 'Pending' | 'In Progress' | 'Completed'): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getClientById, updateClient, deleteClient } = useClients()

  const client = id ? getClientById(id) : undefined
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState(client?.name ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [sex, setSex] = useState<ClientSex>(client?.sex ?? 'Female')
  const [unit, setUnit] = useState<MeasurementUnit>(client?.measurement_unit ?? 'cm')
  const [measurements, setMeasurements] = useState<Record<MeasurementField, string>>({
    chest: String(client?.measurements.chest ?? ''),
    bust: String(client?.measurements.bust ?? ''),
    waist: String(client?.measurements.waist ?? ''),
    shoulder: String(client?.measurements.shoulder ?? ''),
    hip: String(client?.measurements.hip ?? ''),
    inseam: String(client?.measurements.inseam ?? ''),
    sleeve: String(client?.measurements.sleeve ?? ''),
    neck: String(client?.measurements.neck ?? ''),
    thigh: String(client?.measurements.thigh ?? ''),
    ankle: String(client?.measurements.ankle ?? ''),
    head: String(client?.measurements.head ?? ''),
  })

  const jobs = useMemo(() => mockClientJobs.filter((job) => job.clientId === client?.id), [client?.id])

  if (!client) {
    return (
      <section className="section stack gap-16">
        <h2>Client Not Found</h2>
        <p className="text-muted">This client may have been deleted.</p>
        <Link to="/clients" className="btn btn-secondary">
          Back to Clients
        </Link>
      </section>
    )
  }

  const activeClient = client

  function handleSave(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    updateClient(activeClient.id, {
      name: name.trim(),
      phone: phone.trim(),
      sex,
      measurement_unit: unit,
      measurements: buildMeasurements(measurements),
    })

    setEditMode(false)
  }

  function handleDelete(): void {
    const confirmed = window.confirm(`Delete ${activeClient.name}? This action cannot be undone.`)
    if (!confirmed) return

    deleteClient(activeClient.id)
    navigate('/clients')
  }

  function updateMeasurement(field: MeasurementField, value: string): void {
    setMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section className="section stack gap-16">
      <div className="row-between">
        <Link to="/clients" className="btn btn-ghost btn-icon" aria-label="Back to clients">
          <ArrowLeft size={18} />
        </Link>
        <h2>Client Profile</h2>
        {editMode ? (
          <button type="submit" form="client-profile-form" className="btn btn-primary btn-sm">
            <Save size={14} />
            Save
          </button>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
            <PencilLine size={14} />
            Edit
          </button>
        )}
      </div>

      <form id="client-profile-form" className="stack gap-12" onSubmit={handleSave}>
        <label className="input-group">
          <span className="input-label">Full Name</span>
          <input className="input" value={name} onChange={(event) => setName(event.target.value)} disabled={!editMode} />
        </label>

        <label className="input-group">
          <span className="input-label">Phone Number</span>
          <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={!editMode} />
        </label>

        <div className="input-group">
          <span className="input-label">Sex</span>
          <div className="pill-group">
            {(['Female', 'Male'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`pill${sex === value ? ' active' : ''}`}
                onClick={() => {
                  if (!editMode) return
                  setSex(value)
                }}
                disabled={!editMode}
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
                onClick={() => {
                  if (!editMode) return
                  setUnit(value)
                }}
                disabled={!editMode}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="card stack gap-12">
          <h4>Measurements ({unit})</h4>
          <div className="stack gap-10">
            {measurementFields.map((field) => (
              <label key={field} className="input-group">
                <span className="input-label">{fieldLabels[field]}</span>
                <input
                  className="input"
                  value={measurements[field]}
                  onChange={(event) => updateMeasurement(field, event.target.value)}
                  inputMode="decimal"
                  disabled={!editMode}
                />
              </label>
            ))}
          </div>
        </div>
      </form>

      <div className="card stack gap-12">
        <div className="row-between">
          <h4>Client Jobs</h4>
          <Link to="/jobs" className="home-link">
            Open Jobs
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="text-sm text-muted">No jobs linked to this client yet.</p>
        ) : (
          <div className="stack gap-8">
            {jobs.map((job) => (
              <article key={job.id} className="card-pressable">
                <div className="row-between">
                  <p className="font-semibold">{job.title}</p>
                  <span className={statusClass(job.status)}>{job.status}</span>
                </div>
                <p className="text-sm text-muted mt-4">Due: {formatDate(job.deadlineDate)}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="btn btn-danger btn-full" onClick={handleDelete}>
        <Trash2 size={16} />
        Delete Client
      </button>
    </section>
  )
}
