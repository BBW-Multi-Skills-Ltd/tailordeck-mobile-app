import { CheckCircle2 } from 'lucide-react'

type StepProgressProps = {
  step: number
  labels: readonly string[]
}

const shortLabels = ['Client', 'Material', 'Costing', 'Deadline'] as const

export function StepProgress({ step, labels }: StepProgressProps) {
  const safeStep = Math.min(Math.max(step, 0), labels.length - 1)
  const percent = Math.round(((safeStep + 1) / labels.length) * 100)

  return (
    <section className="wizard-progress-card" aria-label={`New job progress ${percent}% complete`}>
      <div className="row-between wizard-progress-head">
        <p className="wizard-progress-step">Step {safeStep + 1}: {labels[safeStep]}</p>
        <span className="wizard-progress-percent">{percent}%</span>
      </div>

      <div className="wizard-progress-track" aria-hidden>
        <span className="wizard-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="wizard-progress-pills">
        {labels.map((label, index) => {
          const isDone = index < safeStep
          const isActive = index === safeStep

          return (
            <span key={label} className={`wizard-progress-pill${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}`}>
              {isDone ? <CheckCircle2 size={12} /> : null}
              {shortLabels[index] ?? label}
            </span>
          )
        })}
      </div>
    </section>
  )
}

export function ReviewProgressHeader() {
  return (
    <div className="wizard-review-heading">
      <p>Review details</p>
      <span>Check everything before creating the contract.</span>
    </div>
  )
}
