import { CheckCircle2, ClipboardCheck } from 'lucide-react'
import type { JobStatus } from '../../types/job'

type JobCompletionSectionProps = {
  completedAt?: string | null
  errorMessage?: string
  isUpdating?: boolean
  status: JobStatus
  onComplete: () => void
}

function formatCompletedAt(value?: string | null): string {
  if (!value) return 'Completed'
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function JobCompletionSection({ completedAt, errorMessage, isUpdating = false, onComplete, status }: JobCompletionSectionProps) {
  const completed = status === 'Completed'

  return (
    <article className="job-completion-card card">
      <div className="job-completion-copy">
        <span className={`job-completion-icon${completed ? ' complete' : ''}`}>
          {completed ? <CheckCircle2 size={18} /> : <ClipboardCheck size={18} />}
        </span>
        <div>
          <h4>{completed ? 'Job Completed' : 'Delivery Status'}</h4>
          <p>{completed ? formatCompletedAt(completedAt) : 'Mark this job completed after delivery.'}</p>
        </div>
      </div>

      {completed ? null : (
        <button type="button" className="btn btn-primary job-completion-btn" onClick={onComplete} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Mark Completed'}
        </button>
      )}
      {errorMessage ? <p className="inline-feedback-error job-completion-error" role="alert">{errorMessage}</p> : null}
    </article>
  )
}
