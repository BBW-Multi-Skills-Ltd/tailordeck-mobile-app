import { ArrowRight, FilePenLine } from 'lucide-react'

type JobDraftActionsProps = {
  onResume: () => void
}

export function JobDraftActions({ onResume }: JobDraftActionsProps) {
  return (
    <article className="job-draft-card card">
      <div className="job-completion-copy">
        <span className="job-completion-icon">
          <FilePenLine size={18} />
        </span>
        <div>
          <h4>Draft Job</h4>
          <p>Finish this job setup when you are ready.</p>
        </div>
      </div>

      <button type="button" className="btn btn-primary job-completion-btn" onClick={onResume}>
        Resume Draft <ArrowRight size={16} />
      </button>
    </article>
  )
}
