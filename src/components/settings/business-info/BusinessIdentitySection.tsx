import { BadgeCheck, Building2 } from 'lucide-react'
import type { BusinessIdentitySectionProps } from './BusinessInfoTypes'

export function BusinessIdentitySection({
  onCacRegistrationNumberChange,
  onShopNameChange,
  settings,
}: BusinessIdentitySectionProps) {
  return (
    <section className="clay-card business-form-card">
      <p className="business-form-card-title">Business Identity</p>
      <div className="business-form-field-stack">
        <div className="input-group settings-business-group">
          <label className="settings-business-label row gap-6"><Building2 size={15} />Shop Name</label>
          <input className="input settings-business-input" placeholder="Your shop name" value={settings.businessInfo.shopName} onChange={(event) => onShopNameChange(event.target.value)} />
        </div>

        <div className="input-group settings-business-group">
          <label className="settings-business-label row gap-6"><BadgeCheck size={15} />CAC / RC Number</label>
          <input className="input settings-business-input" placeholder="RC 1234567" value={settings.businessInfo.cacRegistrationNumber} onChange={(event) => onCacRegistrationNumberChange(event.target.value)} />
        </div>
      </div>
    </section>
  )
}
