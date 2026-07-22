import { CheckCircle2 } from 'lucide-react'
import { onboardingSetupSteps } from './onboardingSetupConfig'

export function OnboardingSetupProgress({ step }: { step: number }) {
  const percent = Math.round(((step + 1) / onboardingSetupSteps.length) * 100)

  return (
    <section className="wizard-progress-card onboarding-setup-progress" aria-label={`Shop setup progress ${percent}% complete`}>
      <div className="row-between wizard-progress-head">
        <p className="wizard-progress-step">Step {step + 1}: {onboardingSetupSteps[step]}</p>
        <span className="wizard-progress-percent">{percent}%</span>
      </div>
      <div className="wizard-progress-track" aria-hidden>
        <span className="wizard-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="wizard-progress-pills">
        {onboardingSetupSteps.map((label, index) => {
          const isDone = index < step
          const isActive = index === step
          return (
            <span key={label} className={`wizard-progress-pill${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}`}>
              {isDone ? <CheckCircle2 size={12} /> : null}
              {label}
            </span>
          )
        })}
      </div>
    </section>
  )
}
