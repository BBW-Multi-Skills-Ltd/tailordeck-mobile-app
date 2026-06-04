import { ArrowLeft } from 'lucide-react'

type NewJobHeaderProps = {
  onBack: () => void
}

export function NewJobHeader({ onBack }: NewJobHeaderProps) {
  return (
    <div className="row-between">
      <button type="button" className="btn btn-ghost btn-icon" onClick={onBack} aria-label="Back">
        <ArrowLeft size={18} />
      </button>
      <h2 className="app-page-heading">New Job</h2>
      <span style={{ width: '44px' }} />
    </div>
  )
}

