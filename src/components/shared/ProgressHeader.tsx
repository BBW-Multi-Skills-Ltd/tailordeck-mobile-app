type ProgressHeaderProps = {
  title: string
  description: string
  percent: number
  className?: string
}

export default function ProgressHeader({ title, description, percent, className }: ProgressHeaderProps) {
  const safePercent = Math.min(100, Math.max(0, percent))

  return (
    <section className={`td-progress-card${className ? ` ${className}` : ''}`}>
      <div className="row-between">
        <div className="stack gap-2">
          <p className="td-progress-title">{title}</p>
          <p className="td-progress-copy">{description}</p>
        </div>
        <span className="td-progress-percent">{safePercent}%</span>
      </div>
      <div className="td-progress-track" aria-hidden>
        <span className="td-progress-fill" style={{ width: `${safePercent}%` }} />
      </div>
    </section>
  )
}
