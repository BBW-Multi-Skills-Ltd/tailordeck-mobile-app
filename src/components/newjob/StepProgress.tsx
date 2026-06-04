type StepProgressProps = {
  step: number
  labels: readonly string[]
}

export function StepProgress({ step, labels }: StepProgressProps) {
  return (
    <div className="stack gap-8">
      <p className="text-sm text-muted">
        Step {step + 1} of {labels.length} - {labels[step]}
      </p>
      <div className="step-progress">
        {labels.map((label, index) => (
          <div
            key={label}
            className={`step-bar${index < step ? ' done' : ''}${index === step ? ' active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

