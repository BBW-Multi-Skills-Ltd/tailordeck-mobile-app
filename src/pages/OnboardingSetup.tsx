import { useNavigate } from 'react-router-dom'
import { BrandStepFields, BusinessStepFields, ContactStepFields } from '../components/onboarding/setup/OnboardingSetupFields'
import { OnboardingSkipDialog } from '../components/onboarding/setup/OnboardingSkipDialog'
import { OnboardingSetupProgress } from '../components/onboarding/setup/OnboardingSetupProgress'
import { OnboardingSetupStatusView } from '../components/onboarding/setup/OnboardingSetupStatusView'
import { onboardingSetupStepCopy, onboardingSetupSteps } from '../components/onboarding/setup/onboardingSetupConfig'
import { useOnboardingSetupState } from '../components/onboarding/setup/useOnboardingSetupState'
import { useAuth } from '../context/authContextCore'
import { markOnboardingStage } from '../lib/auth'
import { loadTailorSettings } from '../lib/settings'
import { syncPendingOnboardingSettings } from '../services/onboardingService'

export default function OnboardingSetup() {
  const navigate = useNavigate()
  const auth = useAuth()
  const { actions, state } = useOnboardingSetupState()

  async function handleProceed() {
    if (!auth.session) {
      markOnboardingStage('setup')
      navigate('/auth/signup')
      return
    }

    try {
      await syncPendingOnboardingSettings(loadTailorSettings())
    } catch (error) {
      console.warn('Unable to sync onboarding setup before plan selection:', error)
    }
    markOnboardingStage('plan')
    navigate('/onboarding/plan')
  }

  if (state.status !== 'editing') {
    return <OnboardingSetupStatusView status={state.status} onProceed={handleProceed} />
  }

  return (
    <main className="page-full onboarding-page onboarding-page-step">
      <div className="onboarding-shell onboarding-shell-step">
        <div className="onboarding-brand compact">
          <div className="onboarding-brand-icon" aria-hidden>
            <img src="/Tailor%20deck%20app%20icon%20for%20phone%20screen.png" alt="" className="onboarding-brand-logo" />
          </div>
          <h2 className="onboarding-section-title">Set Up Your Shop</h2>
        </div>

        <OnboardingSetupProgress step={state.step} />

        <div className="onboarding-setup-step-copy">
          <h3>{onboardingSetupStepCopy[state.step].title}</h3>
          <p>{onboardingSetupStepCopy[state.step].helper}</p>
        </div>

        <section className="onboarding-card onboarding-card-plain onboarding-card-step onboarding-setup-card">
          {state.step === 0 ? (
            <BusinessStepFields
              businessAddress={state.businessAddress}
              businessName={state.businessName}
              cacRegistrationNumber={state.cacRegistrationNumber}
              onBusinessAddressChange={actions.setBusinessAddress}
              onBusinessNameChange={actions.setBusinessName}
              onCacRegistrationNumberChange={actions.setCacRegistrationNumber}
            />
          ) : null}

          {state.step === 1 ? (
            <BrandStepFields logoUrl={state.logoUrl} signatureUrl={state.signatureUrl} onImageUpload={actions.handleImageUpload} />
          ) : null}

          {state.step === 2 ? (
            <ContactStepFields
              businessEmail={state.businessEmail}
              businessPhone={state.businessPhone}
              socialHandles={state.socialHandles}
              website={state.website}
              onBusinessEmailChange={actions.setBusinessEmail}
              onBusinessPhoneChange={actions.setBusinessPhone}
              onSocialHandleChange={actions.updateSocialHandle}
              onWebsiteChange={actions.setWebsite}
            />
          ) : null}

          <div className="onboarding-wizard-actions">
            <button type="button" className="btn btn-secondary" onClick={() => actions.setStep((prev) => Math.max(prev - 1, 0))} disabled={state.step === 0}>
              Previous
            </button>
            <button type="button" className="btn btn-primary" onClick={actions.handleNext}>
              {state.step === onboardingSetupSteps.length - 1 ? 'Finish Setup' : 'Next'}
            </button>
          </div>

          <button type="button" className="onboarding-skip-btn" onClick={() => actions.setSkipOpen(true)}>
            Skip for now
          </button>
        </section>
      </div>

      {state.skipOpen ? <OnboardingSkipDialog onClose={() => actions.setSkipOpen(false)} onSkip={() => actions.finishSetup(true)} /> : null}
    </main>
  )
}
