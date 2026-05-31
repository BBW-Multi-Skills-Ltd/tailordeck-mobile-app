import { AtSign, Building2, Globe, Mail, Phone, Plus, Trash2 } from 'lucide-react'
import { socialPlatformColor, socialPlatformIcon, socialPlatforms } from './settingsOptions'
import type { SocialPlatform, TailorSettings } from '../../lib/settings'

type BusinessInfoPanelProps = {
  settings: TailorSettings
  businessPhoneLocalPart: string
  websiteLocalPart: string
  socialPlatform: SocialPlatform
  socialHandleInput: string
  saved: boolean
  onShopNameChange: (value: string) => void
  onBusinessPhoneChange: (value: string) => void
  onBusinessEmailChange: (value: string) => void
  onWebsiteChange: (value: string) => void
  onSocialPlatformChange: (value: SocialPlatform) => void
  onSocialHandleInputChange: (value: string) => void
  onAddSocialHandle: () => void
  onRemoveSocialHandle: (id: string) => void
  onShopAddressChange: (value: string) => void
  onSave: () => void
}

export default function BusinessInfoPanel({
  settings,
  businessPhoneLocalPart,
  websiteLocalPart,
  socialPlatform,
  socialHandleInput,
  saved,
  onShopNameChange,
  onBusinessPhoneChange,
  onBusinessEmailChange,
  onWebsiteChange,
  onSocialPlatformChange,
  onSocialHandleInputChange,
  onAddSocialHandle,
  onRemoveSocialHandle,
  onShopAddressChange,
  onSave,
}: BusinessInfoPanelProps) {
  const BusinessHandleIcon = socialPlatformIcon.Instagram

  return (
    <div className="stack settings-business-form">
      <div className="input-group settings-business-group">
        <label className="settings-business-label row gap-6"><Building2 size={15} />Shop Name</label>
        <p className="settings-help-text">This is shown on documents and business header.</p>
        <input className="input settings-business-input" placeholder="Your shop name" value={settings.businessInfo.shopName} onChange={(event) => onShopNameChange(event.target.value)} />
      </div>

      <div className="input-group settings-business-group">
        <label className="settings-business-label row gap-6"><Phone size={15} />Business Phone</label>
        <p className="settings-help-text">Used for client contact and invoice footer.</p>
        <div className="settings-phone-input-wrap">
          <span className="settings-phone-prefix">+234</span>
          <input className="input settings-business-input settings-phone-input" inputMode="numeric" placeholder="8012345678" value={businessPhoneLocalPart} onChange={(event) => onBusinessPhoneChange(event.target.value)} />
        </div>
      </div>

      <div className="input-group settings-business-group">
        <label className="settings-business-label row gap-6"><Mail size={15} />Business Email</label>
        <p className="settings-help-text">For receipts, invoices, and support contact.</p>
        <input className="input settings-business-input" value={settings.businessInfo.businessEmail} onChange={(event) => onBusinessEmailChange(event.target.value)} />
      </div>

      <div className="input-group settings-business-group">
        <label className="settings-business-label row gap-6"><Globe size={15} />Business Website</label>
        <p className="settings-help-text">Optional website link shown on invoices.</p>
        <div className="settings-phone-input-wrap">
          <span className="settings-phone-prefix">https://</span>
          <input className="input settings-business-input settings-phone-input settings-website-input" placeholder="yourbusiness.com" value={websiteLocalPart} onChange={(event) => onWebsiteChange(event.target.value)} />
        </div>
      </div>

      <div className="stack settings-business-group">
        <p className="settings-business-label row gap-6"><BusinessHandleIcon size={15} />Business Handle</p>
        <p className="settings-help-text">Add social handles used by your business.</p>

        <div className="settings-business-social-builder">
          <div className="settings-business-platform-row">
            {socialPlatforms.map((platform) => {
              const Icon = socialPlatformIcon[platform]
              return (
                <button key={platform} type="button" className={`settings-choice-pill settings-business-platform-btn${socialPlatform === platform ? ' active' : ''}`} onClick={() => onSocialPlatformChange(platform)}>
                  <span className="settings-business-platform-pill-content">
                    <Icon size={14} style={{ color: socialPlatformColor[platform] }} />
                    <span>{platform}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="settings-business-handle-row">
            <div className="settings-phone-input-wrap flex-1">
              <span className="settings-phone-prefix">
                <AtSign size={14} />
              </span>
              <input className="input settings-business-input settings-phone-input" placeholder="yourhandle" value={socialHandleInput} onChange={(event) => onSocialHandleInputChange(event.target.value.replace(/^@+/, ''))} />
            </div>
            <button type="button" className="btn btn-primary settings-business-add-btn" onClick={onAddSocialHandle}>
              <Plus size={15} />
              Add
            </button>
          </div>
        </div>

        <div className="settings-business-handle-list">
          {settings.businessInfo.socialHandles.map((item) => {
            const Icon = socialPlatformIcon[item.platform]
            return (
              <div key={item.id} className="settings-business-handle-item">
                <div className="row gap-8 min-w-0">
                  <Icon className="settings-business-handle-icon" size={14} />
                  <p className="settings-business-handle-text">{item.platform}: {item.handle}</p>
                </div>
                <button type="button" className="btn btn-ghost btn-icon settings-business-delete" onClick={() => onRemoveSocialHandle(item.id)} aria-label={`Remove ${item.platform} handle`}>
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="input-group settings-business-group">
        <label className="settings-business-label row gap-6"><Building2 size={15} />Shop Address</label>
        <p className="settings-help-text">Your physical shop location for delivery and pickup.</p>
        <textarea className="input settings-textarea settings-business-input" value={settings.businessInfo.shopAddress} onChange={(event) => onShopAddressChange(event.target.value)} />
      </div>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Business Info
      </button>
      {saved ? <p className="text-sm text-success">Business Info saved.</p> : null}
    </div>
  )
}
