import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Ruler } from 'lucide-react'
import { markOnboardingStage } from '../lib/auth'
import { loadTailorSettings, saveTailorSettings, type MeasurementUnit } from '../lib/settings'

export default function OnboardingSetup() {
  const navigate = useNavigate()
  const currentSettings = loadTailorSettings()
  const [step, setStep] = useState<1 | 2>(1)
  const [shopName, setShopName] = useState(currentSettings.businessInfo.shopName)
  const [shopDescription, setShopDescription] = useState('')
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(currentSettings.preferences.measurementUnit)

  function goBack() {
    if (step === 1) {
      navigate('/auth/signup')
      return
    }
    setStep(1)
  }

  function completeSetup() {
    const current = loadTailorSettings()
    saveTailorSettings({
      ...current,
      preferences: {
        ...current.preferences,
        measurementUnit,
      },
      businessInfo: {
        ...current.businessInfo,
        shopName: shopName.trim() || current.businessInfo.shopName,
      },
      brand: {
        ...current.brand,
        name: shopName.trim() || current.brand.name,
      },
      updatedAt: new Date().toISOString(),
    })

    void shopDescription
    markOnboardingStage('plan')
    navigate('/onboarding/plan')
  }

  return (
    <main className="page-full onboarding-page onboarding-page-step">
      <div className="onboarding-shell onboarding-shell-step">
        <header className="onboarding-topbar">
          <button type="button" className="onboarding-back-btn" onClick={goBack} aria-label="Back">
            <ArrowLeft size={16} />
          </button>
          <p className="onboarding-step-text">{step} of 2</p>
        </header>

        <div className="onboarding-progress">
          <span className="onboarding-progress-fill" style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>

        {step === 1 ? (
          <>
            <div className="onboarding-brand compact">
              <div className="onboarding-brand-icon" aria-hidden>
                <img src="/Tailor%20deck%20app%20icon%20for%20phone%20screen.png" alt="" className="onboarding-brand-logo" />
              </div>
              <h2 className="onboarding-section-title">Set Up Your Shop</h2>
            </div>

            <section className="onboarding-card onboarding-card-plain onboarding-card-step">
              <div className="input-group">
                <label htmlFor="onboard-shop-name" className="auth-label">
                  Shop Name
                </label>
                <input
                  id="onboard-shop-name"
                  type="text"
                  className="auth-input"
                  placeholder="Enter your shop name"
                  value={shopName}
                  onChange={(event) => setShopName(event.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="onboard-shop-desc" className="auth-label">
                  Shop Description (Optional)
                </label>
                <textarea
                  id="onboard-shop-desc"
                  className="auth-input onboarding-textarea"
                  placeholder="Tell customers about your shop"
                  value={shopDescription}
                  onChange={(event) => setShopDescription(event.target.value)}
                />
              </div>

              <div className="onboarding-step-actions">
                <button type="button" className="btn btn-primary btn-full onboarding-primary-btn" onClick={() => setStep(2)}>
                  Continue
                </button>
                <button type="button" className="onboarding-skip-btn" onClick={() => setStep(2)}>
                  Skip for now
                </button>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="onboarding-preference-head">
              <h2 className="onboarding-section-title">Measurement Preferences</h2>
              <p className="onboarding-caption">Choose your preferred unit for taking measurements</p>
            </section>

            <section className="onboarding-card onboarding-card-step">
              <button
                type="button"
                className={`onboarding-unit-card${measurementUnit === 'cm' ? ' active' : ''}`}
                onClick={() => setMeasurementUnit('cm')}
              >
                <span className="onboarding-unit-icon">
                  <Ruler size={14} />
                </span>
                <span className="onboarding-unit-copy">
                  <span className="onboarding-unit-title">Centimeters (cm)</span>
                  <span className="onboarding-unit-text">Metric system, commonly used internationally</span>
                </span>
                <span className={`onboarding-radio${measurementUnit === 'cm' ? ' checked' : ''}`} aria-hidden />
              </button>

              <button
                type="button"
                className={`onboarding-unit-card${measurementUnit === 'inches' ? ' active' : ''}`}
                onClick={() => setMeasurementUnit('inches')}
              >
                <span className="onboarding-unit-icon">
                  <Ruler size={14} />
                </span>
                <span className="onboarding-unit-copy">
                  <span className="onboarding-unit-title">Inches (in)</span>
                  <span className="onboarding-unit-text">Imperial system, traditional tailoring measurements</span>
                </span>
                <span className={`onboarding-radio${measurementUnit === 'inches' ? ' checked' : ''}`} aria-hidden />
              </button>
            </section>

            <p className="onboarding-note">You can change this preference anytime in your profile settings.</p>

            <button type="button" className="btn btn-primary btn-full onboarding-primary-btn onboarding-complete-btn" onClick={completeSetup}>
              Continue
            </button>
          </>
        )}
      </div>
    </main>
  )
}
