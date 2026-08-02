import { Link, useParams } from 'react-router-dom'
import { JobMeasurementsContent } from '../components/jobmeasurements/JobMeasurementsContent'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { useJobQuery } from '../hooks/useJobQueries'

export default function JobMeasurements() {
  const { id } = useParams<{ id: string }>()
  const jobQuery = useJobQuery(id)

  if (jobQuery.isLoading) return <JobMeasurementsLoading />
  if (!jobQuery.data) return <JobMeasurementsNotFound />

  return <JobMeasurementsContent job={jobQuery.data} />
}

function JobMeasurementsLoading() {
  return (
    <section className="section stack gap-16">
      <div className="skeleton" style={{ height: 42 }} />
      <div className="skeleton" style={{ height: 92 }} />
      <div className="skeleton" style={{ height: 240 }} />
    </section>
  )
}

function JobMeasurementsNotFound() {
  return (
    <section className="section stack gap-16">
      <PageHeader title="Measurements" centered leading={<HistoryBackButton fallbackTo="/jobs" />} />
      <article className="card stack gap-8">
        <h2 className="app-page-heading">Measurement Not Found</h2>
        <p className="text-muted">This job measurement is not available.</p>
        <Link to="/jobs" className="btn btn-secondary">Back to Jobs</Link>
      </article>
    </section>
  )
}
