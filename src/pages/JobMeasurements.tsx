import { ArrowLeft, Phone, Ruler } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { appJobMeasurementById, appJobs } from '../data/appData'
import { labelFromField } from '../data/mockJobMeasurements'
import { getInitial } from '../lib/utils'

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export default function JobMeasurements() {
  const { id } = useParams<{ id: string }>()
  const job = id ? appJobs.find((item) => item.id === id) : undefined
  const snapshot = id ? appJobMeasurementById[id] : undefined

  if (!job || !snapshot) {
    return (
      <section className="section stack gap-16">
        <h2 className="app-page-heading">Measurement Not Found</h2>
        <p className="text-muted">This job measurement is not available.</p>
        <Link to="/jobs" className="btn btn-secondary">
          Back to Jobs
        </Link>
      </section>
    )
  }

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-icon" aria-label="Back to job details">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="app-page-heading">Measurements</h2>
        <span style={{ width: '44px' }} />
      </header>

      <article className="card stack gap-12">
        <div className="row gap-12">
          <div className="client-avatar">{getInitial(job.clientName)}</div>
          <div className="stack gap-4">
            <h3>{job.clientName}</h3>
            <p className="text-sm text-muted row gap-4">
              <Phone size={14} />
              {job.clientPhone}
            </p>
          </div>
        </div>
      </article>

      {snapshot.kind === 'body' ? (
        <div className="stack gap-10">
          {snapshot.persons.map((person) => (
            <article key={person.id} className="card stack gap-10">
              <div className="stack gap-6">
                <p className="row gap-6 text-sm font-semibold">
                  <Ruler size={16} className="client-measure-title-icon" />
                  Measurement
                </p>
                <p className="text-sm text-muted">
                  {person.name} - {person.sex} ({toTitleCase(person.role)})
                </p>
              </div>

              {person.description ? <p className="text-sm text-muted">{person.description}</p> : null}

              <div className="client-measure-grid">
                {Object.entries(person.measurements).map(([field, value]) => (
                  <div key={`${person.id}-${field}`} className="client-measure-item">
                    <p className="text-sm text-muted">{labelFromField(field)} ({snapshot.unit})</p>
                    <p className="client-measure-value">{value}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <article className="card stack gap-10">
          <div className="stack gap-6">
            <p className="row gap-6 text-sm font-semibold">
              <Ruler size={16} className="client-measure-title-icon" />
              Measurement
            </p>
            <p className="text-sm text-muted">
              {snapshot.itemType} - Qty {snapshot.quantity}
            </p>
          </div>

          {snapshot.description ? <p className="text-sm text-muted">{snapshot.description}</p> : null}

          <div className="client-measure-grid">
            {Object.entries(snapshot.measurements).map(([field, value]) => (
              <div key={field} className="client-measure-item">
                <p className="text-sm text-muted">{labelFromField(field)} ({snapshot.unit})</p>
                <p className="client-measure-value">{value}</p>
              </div>
            ))}
          </div>
        </article>
      )}
    </section>
  )
}
