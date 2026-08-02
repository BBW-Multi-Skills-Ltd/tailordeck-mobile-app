import { Phone } from 'lucide-react'
import { getInitial } from '../../lib/utils'
import type { JobWithRelations } from '../../services/types'

export function JobMeasurementsClientCard({ job }: { job: JobWithRelations }) {
  return (
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
  )
}
