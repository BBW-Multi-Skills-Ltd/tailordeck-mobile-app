import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ruler } from 'lucide-react'
import ChoiceCard from '../components/shared/ChoiceCard'
import ProgressHeader from '../components/shared/ProgressHeader'
import { loadTailorSettings, saveTailorSettings, type MeasurementUnit } from '../lib/settings'
import { updateBusinessProfile } from '../services/businessService'
import { updatePreferences } from '../services/preferencesService'

export default function OnboardingSetup() {
  const navigate = useNavigate()
  const currentSettings = loadTailorSettings()
  const [shopName, setShopName] = useState(currentSettings.businessInfo.shopName)
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(currentSettings.preferences.measurementUnit)
  const [saving, setSaving] = useState(false)

  async function completeSetup() {
    const current = loadTailorSettings()
    const normalizedShopName = shopName.trim() || current.businessInfo.shopName
    saveTailorSettings({
      ...current,
      preferences: {
        ...current.preferences,
        measurementUnit,
      },
      businessInfo: {
        ...current.businessInfo,
        shopName: normalizedShopName,
      },
      brand: {
        ...current.brand,
        name: normalizedShopName || current.brand.name,
      },
      updatedAt: new Date().toISOString(),
    })

    setSaving(true)
    try {
      await Promise.all([
        updateBusinessProfile({ shop_name: normalizedShopName }),
        updatePreferences({ measurement_unit: measurementUnit }),
      ])
      navigate('/onboarding/plan')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to save setup.')
    } finally {
      setSaving(false)
    }
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

        <ProgressHeader
          title="Your workspace is ready"
          description="Add your shop basics now. Business info and invoices can be finished later."
          percent={50}
        />

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
            <span className="auth-label">Measurement Preference</span>
            <div className="stack gap-8">
              <ChoiceCard
                title="Centimeters (cm)"
                description="Metric system, commonly used internationally"
                icon={Ruler}
                active={measurementUnit === 'cm'}
                onClick={() => setMeasurementUnit('cm')}
              >
                <span className={`onboarding-radio${measurementUnit === 'cm' ? ' checked' : ''}`} aria-hidden />
              </ChoiceCard>

              <ChoiceCard
                title="Inches (in)"
                description="Traditional tailoring measurements"
                icon={Ruler}
                active={measurementUnit === 'inches'}
                onClick={() => setMeasurementUnit('inches')}
              >
                <span className={`onboarding-radio${measurementUnit === 'inches' ? ' checked' : ''}`} aria-hidden />
              </ChoiceCard>
            </div>
          </div>

          <p className="onboarding-note">
            You can complete business info and invoice template setup later in Settings for better invoices and receipts.
          </p>

          <div className="onboarding-step-actions">
            <button type="button" className="btn btn-primary btn-full onboarding-primary-btn" onClick={() => void completeSetup()} disabled={saving}>
              {saving ? 'Saving...' : 'Continue'}
            </button>
            <button type="button" className="onboarding-skip-btn" onClick={() => void completeSetup()} disabled={saving}>
              Skip for now
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
