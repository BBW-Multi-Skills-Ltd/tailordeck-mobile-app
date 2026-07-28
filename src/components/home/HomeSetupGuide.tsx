import { CheckCircle2, Circle, FileText, Scissors, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

type HomeSetupGuideProps = {
  shopName: string
  setupWasSkipped: boolean
}

type SetupItem = {
  label: string
  description: string
  complete: boolean
  icon: typeof Store
}

export function HomeSetupGuide({ shopName, setupWasSkipped }: HomeSetupGuideProps) {
  const items: SetupItem[] = [
    {
      label: 'Shop basics',
      description: shopName ? `${shopName} is ready.` : 'Add your business name.',
      complete: Boolean(shopName),
      icon: Store,
    },
    {
      label: 'Invoice setup',
      description: 'Add logo, signature, and business details.',
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
  const title = setupWasSkipped ? 'Finish your shop setup' : 'Create your first job'
  const copy = setupWasSkipped
    ? 'Add missing shop details now, or start with a client job.'
    : 'Add client details, measurements, pricing, and deadline in one guided flow.'
  const secondaryLink = setupWasSkipped ? '/business' : '/documents'
  const secondaryLabel = setupWasSkipped ? 'Finish setup' : 'Invoice setup'

  return (
    <article className="home-setup-card card stack gap-12">
      <div className="row-between">
        <div className="stack gap-4">
          <p className="home-setup-eyebrow">Workspace started</p>
          <h2 className="home-setup-title">{title}</h2>
          <p className="home-setup-copy">{copy}</p>
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
        <Link to={secondaryLink} className="btn btn-secondary flex-1">
          {secondaryLabel}
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
