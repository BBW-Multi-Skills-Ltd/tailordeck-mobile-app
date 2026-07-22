import { Globe, Mail, Phone } from 'lucide-react'
import type { BusinessContactSectionProps } from './BusinessInfoTypes'

export function BusinessContactSection({
  businessPhoneLocalPart,
  onBusinessEmailChange,
  onBusinessPhoneChange,
  onWebsiteChange,
  settings,
  websiteLocalPart,
}: BusinessContactSectionProps) {
  return (
    <section className="clay-card business-form-card">
      <p className="business-form-card-title">Contact Details</p>
      <div className="business-form-field-stack">
        <div className="input-group settings-business-group">
          <label className="settings-business-label row gap-6"><Phone size={15} />Business Phone</label>
          <div className="settings-phone-input-wrap">
            <span className="settings-phone-prefix">+234</span>
            <input className="input settings-business-input settings-phone-input" inputMode="numeric" placeholder="8012345678" value={businessPhoneLocalPart} onChange={(event) => onBusinessPhoneChange(event.target.value)} />
          </div>
        </div>

        <div className="input-group settings-business-group">
          <label className="settings-business-label row gap-6"><Mail size={15} />Business Email</label>
          <input className="input settings-business-input" placeholder="hello@yourshop.com" value={settings.businessInfo.businessEmail} onChange={(event) => onBusinessEmailChange(event.target.value)} />
        </div>

        <div className="input-group settings-business-group">
          <label className="settings-business-label row gap-6"><Globe size={15} />Business Website</label>
          <div className="settings-phone-input-wrap">
            <span className="settings-phone-prefix">https://</span>
            <input className="input settings-business-input settings-phone-input settings-website-input" placeholder="yourbusiness.com" value={websiteLocalPart} onChange={(event) => onWebsiteChange(event.target.value)} />
          </div>
        </div>
      </div>
    </section>
  )
}
