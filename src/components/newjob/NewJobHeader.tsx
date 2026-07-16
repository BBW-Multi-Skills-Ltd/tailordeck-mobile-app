import { ArrowLeft } from 'lucide-react'
import PageHeader from '../shared/PageHeader'

type NewJobHeaderProps = {
  onBack: () => void
}

export function NewJobHeader({ onBack }: NewJobHeaderProps) {
  return (
    <PageHeader
      title="New Job"
      centered
      leading={(
        <button type="button" className="btn btn-ghost btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
      )}
    />
  )
}
