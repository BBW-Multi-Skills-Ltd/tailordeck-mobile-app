import { Link, useParams } from 'react-router-dom'
import { JobDetailContent } from '../components/jobdetail/page/JobDetailContent'
import { useJobDetailData } from '../components/jobdetail/page/useJobDetailData'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const { brand, details, job, jobQuery, jobRow } = useJobDetailData(id)

  if (jobQuery.isLoading) return <JobDetailLoading />
  if (!job) return <JobDetailNotFound />

  return <JobDetailContent job={job} brand={brand} details={details} measurementOrderScope={jobRow?.order_scope} completedAt={jobRow?.completed_at} />
}

function JobDetailLoading() {
  return (
    <section className="section stack gap-16">
      <div className="skeleton" style={{ height: 42 }} />
      <div className="skeleton" style={{ height: 96 }} />
      <div className="skeleton" style={{ height: 220 }} />
    </section>
  )
}

function JobDetailNotFound() {
  return (
    <section className="section stack gap-16">
      <h2 className="app-page-heading">Job Not Found</h2>
      <p className="text-muted">This job may have been removed or is unavailable.</p>
      <Link to="/jobs" className="btn btn-secondary">Back to Jobs</Link>
    </section>
  )
}
