export function GuidedCardHeader({ copy, step, title }: { copy: string; step: string; title: string }) {
  return (
    <div className="wizard-guided-title-row">
      <span className="wizard-guided-step">{step}</span>
      <div>
        <p className="wizard-guided-title">{title}</p>
        <p className="wizard-guided-copy">{copy}</p>
      </div>
    </div>
  )
}

export function ChoiceCard({
  active,
  description,
  onClick,
  title,
}: {
  active: boolean
  description: string
  onClick: () => void
  title: string
}) {
  return (
    <button type="button" className={`wizard-choice-card${active ? ' active' : ''}`} onClick={onClick}>
      <span className="wizard-choice-title">{title}</span>
      <span className="wizard-choice-copy">{description}</span>
    </button>
  )
}
