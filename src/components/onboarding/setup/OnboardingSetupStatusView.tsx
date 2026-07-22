import { CheckCircle2 } from 'lucide-react'
import type { OnboardingSetupStatus } from './onboardingSetupConfig'

type OnboardingSetupStatusViewProps = {
  status: Exclude<OnboardingSetupStatus, 'editing'>
  onProceed: () => void
}

export function OnboardingSetupStatusView({ onProceed, status }: OnboardingSetupStatusViewProps) {
  return (
    <main className="page-full onboarding-page onboarding-page-step">
      <div className="onboarding-shell onboarding-shell-step onboarding-setup-status">
        {status === 'saving' ? (
          <>
            <div className="onboarding-saving-orb" aria-hidden />
            <h2 className="onboarding-section-title">Setting up your shop...</h2>
            <p className="onboarding-status-copy">Preparing your TailorDeck workspace.</p>
          </>
        ) : (
          <>
            <CheckCircle2 size={76} className="onboarding-success-icon" />
            <h2 className="onboarding-section-title">Your workshop is ready</h2>
            <p className="onboarding-status-copy">Create your account next so TailorDeck can save your shop.</p>
            <button type="button" className="btn btn-primary btn-full onboarding-primary-btn" onClick={onProceed}>
              Proceed to Sign Up
            </button>
          </>
        )}
      </div>
    </main>
  )
}
