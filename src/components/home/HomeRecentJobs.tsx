import { Link } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import EmptyState from '../shared/EmptyState'
import { formatDueDate, getInitial } from '../../lib/utils'
import { statusClass, type RecentJob } from './homeMetrics'

type HomeRecentJobsProps = {
  jobs: RecentJob[]
}

export function HomeRecentJobs({ jobs }: HomeRecentJobsProps) {
  return (
    <div className="stack gap-12">
      <div className="row-between">
        <h2 className="home-section-title">Recent Jobs</h2>
        <Link to="/jobs" className="home-link">View All</Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No jobs yet"
          description="Create your first tailoring job to start tracking clients, measurements, deadlines, and profit."
          actionLabel="Create Job"
          actionTo="/jobs/new"
        />
      ) : (
        <div className="stack gap-8">
          {jobs.map((job) => (
            <RecentJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecentJobCard({ job }: { job: RecentJob }) {
  return (
    <article className="recent-job-card card-pressable">
      <div className="recent-job-icon center">
        <span className="recent-job-initial">{getInitial(job.clientName)}</span>
      </div>
      <div className="stack min-w-0 flex-1 recent-job-main">
        <p className="recent-job-title truncate">{job.title}</p>
        <div className="recent-job-meta-row">
          <p className="recent-job-meta-text">{formatDueDate(job.deadlineDate)}</p>
        </div>
      </div>
      <span className={`${statusClass(job.status)} recent-job-status`}>{job.status}</span>
    </article>
  )
}
