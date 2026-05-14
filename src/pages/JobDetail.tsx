import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { mockJobs } from '../data/mockJobs'
import { formatDateShort, formatNaira, getInitial } from '../lib/utils'

function statusClass(status: 'Pending' | 'In Progress' | 'Completed'): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const job = id ? mockJobs.find((item) => item.id === id) : undefined

  if (!job) {
    return (
      <section className="section stack gap-16">
        <h2>Job Not Found</h2>
        <p className="text-muted">This job may have been removed.</p>
        <Link to="/jobs" className="btn btn-secondary">
          Back to Jobs
        </Link>
      </section>
    )
  }

  return (
    <section className="section stack gap-16">
      <div className="row-between">
        <Link to="/jobs" className="btn btn-ghost btn-icon" aria-label="Back to jobs">
          <ArrowLeft size={18} />
        </Link>
        <h2>Job Detail</h2>
        <span style={{ width: '44px' }} />
      </div>

      <div className="card stack gap-12">
        <div className="row-between">
          <div className="row gap-12">
            <div className="client-avatar">{getInitial(job.clientName)}</div>
            <div className="stack gap-4">
              <h3>{job.clientName}</h3>
              <p className="text-sm text-muted">{job.clientPhone}</p>
            </div>
          </div>
          <span className={statusClass(job.status)}>{job.status}</span>
        </div>

        <div className="divider" />

        <div className="stack gap-8">
          <p className="text-sm text-muted">Job Type</p>
          <p className="text-base font-semibold">{job.jobType}</p>
        </div>

        <div className="stack gap-8">
          <p className="text-sm text-muted">Title</p>
          <p className="text-base font-semibold">{job.title}</p>
        </div>

        <div className="row-between">
          <div className="stack gap-4">
            <p className="text-sm text-muted">Charge</p>
            <p className="text-base font-semibold">{formatNaira(job.chargeAmount)}</p>
          </div>
          <div className="stack gap-4" style={{ textAlign: 'right' }}>
            <p className="text-sm text-muted">Deadline</p>
            <p className="text-base font-semibold">{formatDateShort(job.deadlineDate)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

