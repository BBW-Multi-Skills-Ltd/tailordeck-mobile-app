import { CheckCircle2, Circle, FileText, Store, UserRound } from 'lucide-react'
import type { TailorSettings } from '../../lib/settings'

type SettingsSetupProgressProps = {
  settings: TailorSettings
}

type SetupStep = {
  label: string
  complete: boolean
  icon: typeof UserRound
}

export function SettingsSetupProgress({ settings }: SettingsSetupProgressProps) {
  const steps: SetupStep[] = [
    {
      label: 'Profile',
      complete: Boolean(settings.profile.fullName.trim()) && settings.profile.fullName !== 'Your Name',
      icon: UserRound,
    },
    {
      label: 'Business',
      complete: Boolean(settings.businessInfo.shopName.trim()),
      icon: Store,
    },
    {
      label: 'Invoice',
      complete: Boolean(settings.brand.logoUrl || settings.brand.signatureUrl),
      icon: FileText,
    },
  ]
  const completeCount = steps.filter((step) => step.complete).length
  const progress = Math.round((completeCount / steps.length) * 100)
  const nextStep = steps.find((step) => !step.complete)?.label ?? 'Ready'

  return (
    <article className="settings-setup-card card stack gap-12">
      <div className="row-between">
        <div className="stack gap-4">
          <p className="settings-setup-eyebrow">Shop setup</p>
          <h2 className="settings-setup-title">{progress}% complete</h2>
          <p className="settings-setup-copy">
            {progress === 100 ? 'Your core shop setup is ready.' : `Next: finish ${nextStep.toLowerCase()} setup.`}
          </p>
        </div>
        <span className="settings-setup-percent">{progress}%</span>
      </div>

      <div className="settings-setup-progress" aria-label={`Settings setup ${progress}% complete`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="settings-setup-steps">
        {steps.map((step) => (
          <SetupStepPill key={step.label} step={step} />
        ))}
      </div>
    </article>
  )
}

function SetupStepPill({ step }: { step: SetupStep }) {
  const Icon = step.icon

  return (
    <span className={`settings-setup-step${step.complete ? ' is-complete' : ''}`}>
      <Icon size={14} />
      {step.label}
      {step.complete ? <CheckCircle2 size={14} /> : <Circle size={14} />}
    </span>
  )
}
