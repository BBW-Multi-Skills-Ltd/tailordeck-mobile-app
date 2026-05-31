import { Phone } from 'lucide-react'
import { getInitial } from '../../lib/utils'
import type { MockJob } from '../../types/job'
import { statusClass } from './jobDetailUtils'

export function JobClientCard({ job }: { job: MockJob }) {
  return (
    <article className="card stack gap-12">
      <div className="row-between">
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
        <span className={statusClass(job.status)}>{job.status}</span>
      </div>
    </article>
  )
}
