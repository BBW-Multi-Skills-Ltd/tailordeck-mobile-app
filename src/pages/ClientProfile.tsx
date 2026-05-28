import { ArrowLeft, CalendarDays, PencilLine, Phone, Ruler, Save, Trash2, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { jobMeasurementById, labelFromField, type JobMeasurementSnapshot } from '../data/mockJobMeasurements'
import { mockJobs } from '../data/mockJobs'
import { formatDateShort, formatNaira, getInitial } from '../lib/utils'
import { useClients } from '../hooks/useClients'

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getClientById, deleteClient } = useClients()

  const client = id ? getClientById(id) : undefined

  const completedJobs = useMemo(
    () =>
      mockJobs
        .filter((job) => job.clientId === client?.id && job.status === 'Completed')
        .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1)),
    [client?.id],
  )

  const measurementJobs = useMemo(
    () =>
      mockJobs
        .filter((job) => job.clientId === client?.id)
        .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1)),
    [client?.id],
  )

  const [measurementDrafts, setMeasurementDrafts] = useState<Record<string, JobMeasurementSnapshot>>(() => {
    const entries = mockJobs
      .filter((job) => job.clientId === client?.id)
      .map((job) => {
        const snapshot = jobMeasurementById[job.id]
        if (!snapshot) return [job.id, undefined] as const
        return [job.id, JSON.parse(JSON.stringify(snapshot)) as JobMeasurementSnapshot] as const
      })
      .filter((entry): entry is readonly [string, JobMeasurementSnapshot] => Boolean(entry[1]))

    return Object.fromEntries(entries)
  })
  const [editState, setEditState] = useState<Record<string, boolean>>({})

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

  function blockKey(jobId: string, personId?: string): string {
    return personId ? `${jobId}:${personId}` : `${jobId}:non-body`
  }

  function isEditing(key: string): boolean {
    return Boolean(editState[key])
  }

  function toggleEdit(key: string): void {
    setEditState((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function updateBodyMeasurement(jobId: string, personId: string, field: string, value: string): void {
    const parsed = Number(value)
    setMeasurementDrafts((prev) => {
      const current = prev[jobId]
      if (!current || current.kind !== 'body') return prev

      return {
        ...prev,
        [jobId]: {
          ...current,
          persons: current.persons.map((person) => {
            if (person.id !== personId) return person
            return {
              ...person,
              measurements: {
                ...person.measurements,
                [field]: Number.isNaN(parsed) ? 0 : parsed,
              },
            }
          }),
        },
      }
    })
  }

  function updateNonBodyMeasurement(jobId: string, field: string, value: string): void {
    const parsed = Number(value)
    setMeasurementDrafts((prev) => {
      const current = prev[jobId]
      if (!current || current.kind !== 'non-body') return prev

      return {
        ...prev,
        [jobId]: {
          ...current,
          measurements: {
            ...current.measurements,
            [field]: Number.isNaN(parsed) ? 0 : parsed,
          },
        },
      }
    })
  }

  function handleDeleteClient(): void {
    const confirmed = window.confirm(
      `Delete ${activeClient.name}? This will remove this client profile. This action cannot be undone.`,
    )
    if (!confirmed) return

    deleteClient(activeClient.id)
    navigate('/clients')
  }

  return (
    <section className="section stack gap-16 page-fab-clearance">
      <div className="row-between">
        <Link to="/clients" className="btn btn-ghost btn-icon" aria-label="Back to clients">
          <ArrowLeft size={18} />
        </Link>
        <h2>Client Profile</h2>
        <span style={{ width: '44px' }} />
      </div>

      <article className="card stack gap-12">
        <div className="row gap-12">
          <div className="client-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{getInitial(activeClient.name)}</div>
          <div className="stack gap-4">
            <h3>{activeClient.name}</h3>
            <div className="row gap-12 text-sm text-muted">
              <span className="row gap-4"><UserRound size={14} />{activeClient.sex}</span>
              <span className="row gap-4"><Phone size={14} />{activeClient.phone}</span>
            </div>
          </div>
        </div>
      </article>

      <div className="stack gap-12">
        {measurementJobs.length === 0 ? (
          <p className="text-sm text-muted">The profile is not recorded for this client. Create a job for this client first.</p>
        ) : (
          measurementJobs.map((job) => {
            const snapshot = measurementDrafts[job.id]
            if (!snapshot) return null

            return (
              <div key={job.id} className="stack gap-10">
                {snapshot.kind === 'body'
                  ? snapshot.persons.map((person) => {
                      const key = blockKey(job.id, person.id)
                      const editing = isEditing(key)

                      return (
                        <article key={person.id} className="card stack gap-10">
                          <div className="row-between">
                            <div className="stack gap-6">
                              <p className="row gap-6 text-sm font-semibold">
                                <Ruler size={16} className="client-measure-title-icon" />
                                Measurement
                              </p>
                              <p className="text-sm text-muted">
                                {person.name} - {person.sex} ({toTitleCase(person.role)})
                              </p>
                            </div>
                            <button type="button" className={`btn ${editing ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => toggleEdit(key)}>
                              {editing ? <Save size={14} /> : <PencilLine size={14} />}
                              {editing ? 'Save' : 'Edit'}
                            </button>
                          </div>

                          {person.description ? <p className="text-sm text-muted">{person.description}</p> : null}

                          <div className="client-measure-grid">
                            {Object.entries(person.measurements).map(([field, value]) => (
                              <div key={`${job.id}-${person.id}-${field}`} className="client-measure-item">
                                <p className="text-sm text-muted">{labelFromField(field)} ({snapshot.unit})</p>
                                {editing ? (
                                  <input
                                    className="input client-measure-input"
                                    value={String(value)}
                                    onChange={(event) => updateBodyMeasurement(job.id, person.id, field, event.target.value)}
                                    inputMode="decimal"
                                  />
                                ) : (
                                  <p className="client-measure-value">{value}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </article>
                      )
                    })
                  : (() => {
                      const key = blockKey(job.id)
                      const editing = isEditing(key)

                      return (
                        <article className="card stack gap-10">
                          <div className="row-between">
                            <div className="stack gap-6">
                              <p className="row gap-6 text-sm font-semibold">
                                <Ruler size={16} className="client-measure-title-icon" />
                                Measurement
                              </p>
                              <p className="text-sm text-muted">
                                {snapshot.itemType} - Qty {snapshot.quantity}
                              </p>
                            </div>
                            <button type="button" className={`btn ${editing ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => toggleEdit(key)}>
                              {editing ? <Save size={14} /> : <PencilLine size={14} />}
                              {editing ? 'Save' : 'Edit'}
                            </button>
                          </div>

                          {snapshot.description ? <p className="text-sm text-muted">{snapshot.description}</p> : null}

                          <div className="client-measure-grid">
                            {Object.entries(snapshot.measurements).map(([field, value]) => (
                              <div key={`${job.id}-${field}`} className="client-measure-item">
                                <p className="text-sm text-muted">{labelFromField(field)} ({snapshot.unit})</p>
                                {editing ? (
                                  <input
                                    className="input client-measure-input"
                                    value={String(value)}
                                    onChange={(event) => updateNonBodyMeasurement(job.id, field, event.target.value)}
                                    inputMode="decimal"
                                  />
                                ) : (
                                  <p className="client-measure-value">{value}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </article>
                      )
                    })()}
              </div>
            )
          })
        )}
      </div>

      <section className="stack gap-12">
        <div className="row-between">
          <h4>Job History</h4>
          <p className="text-sm text-muted">{completedJobs.length} job(s)</p>
        </div>

        {completedJobs.length === 0 ? (
          <p className="text-sm text-muted">No job history yet for this client. Create a job for this client.</p>
        ) : (
          <div className="stack gap-8">
            {completedJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="client-history-row card">
                <p className="font-semibold truncate">{job.title}</p>
                <div className="row-between mt-8">
                  <p className="text-sm text-muted row gap-4">
                    <CalendarDays size={14} />
                    Due: {formatDateShort(job.deadlineDate)}
                  </p>
                  <p className="text-sm font-semibold">{formatNaira(job.chargeAmount)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <button type="button" className="btn btn-primary btn-full" onClick={() => navigate(`/jobs/new?clientId=${activeClient.id}`)}>
        Start Another Job for This Client
      </button>

      <button type="button" className="btn btn-danger btn-full" onClick={handleDeleteClient}>
        <Trash2 size={16} />
        Delete Client
      </button>
    </section>
  )
}
