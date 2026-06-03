import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDateShort, formatNaira } from '../../lib/utils'
import type { MockJob } from '../../types/job'

type ClientJobHistoryProps = {
  jobs: MockJob[]
}

export default function ClientJobHistory({ jobs }: ClientJobHistoryProps) {
  return (
    <section className="stack gap-12">
      <div className="row-between">
        <h4>Job History</h4>
        <p className="text-sm text-muted">{jobs.length} job(s)</p>
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-muted">No job history yet for this client. Create a job for this client.</p>
      ) : (
        <div className="stack gap-8">
          {jobs.map((job) => (
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
  )
}
