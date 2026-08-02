import { Ruler } from 'lucide-react'
import { useMemo, useState } from 'react'
import HistoryBackButton from '../shared/HistoryBackButton'
import PageHeader from '../shared/PageHeader'
import { useUpdateJobPersonMutation } from '../../hooks/usePersonQueries'
import type { JobPersonRow, JobWithRelations } from '../../services/types'
import { JobMeasurementsClientCard } from './JobMeasurementsClientCard'
import { JobMeasurementPersonCard } from './JobMeasurementPersonCard'
import { getDraftKey, normalizeMeasurementValue } from './jobMeasurementsUtils'

export function JobMeasurementsContent({ job }: { job: JobWithRelations }) {
  const updatePerson = useUpdateJobPersonMutation(job.id)
  const persons = useMemo(() => [...(job.job_persons ?? [])].sort((a, b) => a.sort_order - b.sort_order), [job.job_persons])
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null)
  const initialDrafts = useMemo(() => buildInitialDrafts(persons), [persons])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savedPersonId, setSavedPersonId] = useState<string | null>(null)

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
      <PageHeader title="Measurements" centered leading={<HistoryBackButton fallbackTo={`/jobs/${job.id}`} />} />
      <JobMeasurementsClientCard job={job} />

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
        {persons.map((person) => (
          <JobMeasurementPersonCard
            key={person.id}
            drafts={drafts}
            initialDrafts={initialDrafts}
            isEditing={editingPersonId === person.id}
            isPending={updatePerson.isPending}
            isSaved={savedPersonId === person.id}
            person={person}
            onEdit={() => setEditingPersonId(person.id)}
            onSave={() => void savePerson(person)}
            onUpdateDraft={(key, value) => setDrafts((prev) => ({ ...prev, [key]: value }))}
          />
        ))}
      </div>
    </section>
  )
}

function buildInitialDrafts(persons: JobPersonRow[]): Record<string, string> {
  const nextDrafts: Record<string, string> = {}
  persons.forEach((person) => {
    Object.entries(person.measurements ?? {}).forEach(([field, value]) => {
      nextDrafts[getDraftKey(person.id, field)] = normalizeMeasurementValue(value)
    })
  })
  return nextDrafts
}
