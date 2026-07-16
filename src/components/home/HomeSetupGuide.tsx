import { CheckCircle2, Circle, FileText, Scissors, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

type HomeSetupGuideProps = {
  shopName: string
}

type SetupItem = {
  label: string
  description: string
  complete: boolean
  icon: typeof Store
}

export function HomeSetupGuide({ shopName }: HomeSetupGuideProps) {
  const items: SetupItem[] = [
    {
      label: 'Shop basics',
      description: shopName ? `${shopName} is ready.` : 'Add your shop name in Settings.',
      complete: Boolean(shopName),
      icon: Store,
    },
    {
      label: 'Invoice setup',
      description: 'Add logo, colors, and signature when you are ready.',
      complete: false,
      icon: FileText,
    },
    {
      label: 'First job',
      description: 'Create your first order to unlock clients and analytics.',
      complete: false,
      icon: Scissors,
    },
  ]
  const completeCount = items.filter((item) => item.complete).length
  const progress = Math.max(25, Math.round((completeCount / items.length) * 100))

  return (
    <article className="home-setup-card card stack gap-12">
      <div className="row-between">
        <div className="stack gap-4">
          <p className="home-setup-eyebrow">Workspace started</p>
          <h2 className="home-setup-title">Set up your shop as you work</h2>
          <p className="home-setup-copy">Create a job now. TailorDeck will save the client, measurements, and deadline automatically.</p>
        </div>
        <span className="home-setup-percent">{progress}%</span>
      </div>

      <div className="home-setup-progress" aria-label={`Shop setup ${progress}% complete`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="home-setup-list">
        {items.map((item) => (
          <SetupRow key={item.label} item={item} />
        ))}
      </div>

      <div className="home-setup-actions">
        <Link to="/jobs/new" className="btn btn-primary flex-1">
          Create first job
        </Link>
        <Link to="/settings" className="btn btn-secondary flex-1">
          Finish setup
        </Link>
      </div>
    </article>
  )
}

function SetupRow({ item }: { item: SetupItem }) {
  const Icon = item.icon

  return (
    <div className="home-setup-row">
      <span className="home-setup-row-icon">
        <Icon size={15} />
      </span>
      <span className="stack gap-2 min-w-0">
        <strong>{item.label}</strong>
        <span>{item.description}</span>
      </span>
      {item.complete ? <CheckCircle2 size={17} className="text-success" /> : <Circle size={17} className="text-muted" />}
    </div>
  )
}
