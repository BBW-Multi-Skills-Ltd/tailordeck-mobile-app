import { Check, Edit3, Phone, Ruler, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { useJobQuery } from '../hooks/useJobQueries'
import { useUpdateJobPersonMutation } from '../hooks/usePersonQueries'
import { labelFromField } from '../data/mockJobMeasurements'
import { getInitial } from '../lib/utils'
import type { JobPersonRow } from '../services/types'

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function normalizeMeasurementValue(value: number | string): string {
  return String(value ?? '')
}

function getPersonName(person: JobPersonRow): string {
  return person.name?.trim() || person.person_name?.trim() || 'Client'
}

function getDraftKey(personId: string, field: string): string {
  return `${personId}:${field}`
}

export default function JobMeasurements() {
  const { id } = useParams<{ id: string }>()
  const jobQuery = useJobQuery(id)
  const updatePerson = useUpdateJobPersonMutation(id ?? '')
  const job = jobQuery.data
  const persons = useMemo(() => [...(job?.job_persons ?? [])].sort((a, b) => a.sort_order - b.sort_order), [job?.job_persons])
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null)
  const initialDrafts = useMemo(() => {
    const nextDrafts: Record<string, string> = {}
    persons.forEach((person) => {
      Object.entries(person.measurements ?? {}).forEach(([field, value]) => {
        nextDrafts[getDraftKey(person.id, field)] = normalizeMeasurementValue(value)
      })
    })
    return nextDrafts
  }, [persons])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savedPersonId, setSavedPersonId] = useState<string | null>(null)

  if (jobQuery.isLoading) {
    return (
      <section className="section stack gap-16">
        <div className="skeleton" style={{ height: 42 }} />
        <div className="skeleton" style={{ height: 92 }} />
        <div className="skeleton" style={{ height: 240 }} />
      </section>
    )
  }

  if (!job) {
    return (
      <section className="section stack gap-16">
        <PageHeader
          title="Measurements"
          centered
          leading={<HistoryBackButton fallbackTo="/jobs" />}
        />
        <article className="card stack gap-8">
          <h2 className="app-page-heading">Measurement Not Found</h2>
          <p className="text-muted">This job measurement is not available.</p>
          <Link to="/jobs" className="btn btn-secondary">Back to Jobs</Link>
        </article>
      </section>
    )
  }

  async function savePerson(person: JobPersonRow) {
    const measurements = Object.fromEntries(
      Object.keys(person.measurements ?? {}).map((field) => [field, drafts[getDraftKey(person.id, field)] ?? initialDrafts[getDraftKey(person.id, field)] ?? '']),
    )

    await updatePerson.mutateAsync({ id: person.id, updates: { measurements } })
    setEditingPersonId(null)
    setSavedPersonId(person.id)
    window.setTimeout(() => setSavedPersonId(null), 1200)
  }

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Measurements"
        centered
        leading={<HistoryBackButton fallbackTo={`/jobs/${job.id}`} />}
      />

      <article className="card stack gap-12">
        <div className="row gap-12">
          <div className="client-avatar">{getInitial(job.client_name)}</div>
          <div className="stack gap-4 min-w-0">
            <h3>{job.client_name}</h3>
            <p className="text-sm text-muted row gap-4">
              <Phone size={14} />
              {job.client_phone || 'No phone added'}
            </p>
          </div>
        </div>
      </article>

      {persons.length === 0 ? (
        <article className="card stack gap-8">
          <p className="row gap-6 text-sm font-semibold">
            <Ruler size={16} className="client-measure-title-icon" />
            No measurements saved
          </p>
          <p className="text-sm text-muted">This job was saved without measurement fields.</p>
        </article>
      ) : null}

      <div className="stack gap-10">
        {persons.map((person) => {
          const fields = Object.entries(person.measurements ?? {})
          const isEditing = editingPersonId === person.id
          const isSaved = savedPersonId === person.id

          return (
            <article key={person.id} className="card stack gap-10">
              <div className="row-between gap-10">
                <div className="stack gap-6 min-w-0">
                  <p className="row gap-6 text-sm font-semibold">
                    <Ruler size={16} className="client-measure-title-icon" />
                    {person.measurement_kind === 'body' ? 'Body Measurement' : 'Item Measurement'}
                  </p>
                  <p className="text-sm text-muted">
                    {getPersonName(person)} - {person.sex} ({toTitleCase(person.role)})
                  </p>
                </div>
                <button
                  type="button"
                  className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'} btn-icon`}
                  disabled={updatePerson.isPending}
                  onClick={() => (isEditing ? void savePerson(person) : setEditingPersonId(person.id))}
                  aria-label={isEditing ? 'Save measurements' : 'Edit measurements'}
                >
                  {isSaved ? <Check size={17} /> : isEditing ? <Save size={17} /> : <Edit3 size={17} />}
                </button>
              </div>

              {person.item_type ? <p className="text-sm text-muted">Item: {person.item_type}</p> : null}
              {person.description ? <p className="text-sm text-muted">Note: {person.description}</p> : null}
              {person.measurement_kind === 'non_body' ? <p className="text-sm text-muted">Quantity: {person.quantity ?? 1}</p> : null}

              {fields.length > 0 ? (
                <div className="client-measure-grid">
                  {fields.map(([field]) => (
                    <label key={`${person.id}-${field}`} className="client-measure-item">
                      <p className="text-sm text-muted">{labelFromField(field)} ({person.measurement_unit})</p>
                      {isEditing ? (
                        <input
                          className="input client-measure-input"
                          value={drafts[getDraftKey(person.id, field)] ?? initialDrafts[getDraftKey(person.id, field)] ?? ''}
                          onChange={(event) => setDrafts((prev) => ({ ...prev, [getDraftKey(person.id, field)]: event.target.value }))}
                          inputMode="decimal"
                        />
                      ) : (
                        <p className="client-measure-value">{drafts[getDraftKey(person.id, field)] ?? initialDrafts[getDraftKey(person.id, field)] ?? '-'}</p>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No measurement values were filled for this person.</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}


