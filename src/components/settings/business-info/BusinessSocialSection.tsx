import { AtSign, Plus, Trash2 } from 'lucide-react'
import { socialPlatformColor, socialPlatformIcon, socialPlatforms } from '../settingsOptions'
import type { BusinessSocialSectionProps } from './BusinessInfoTypes'

export function BusinessSocialSection({
  onAddSocialHandle,
  onRemoveSocialHandle,
  onSocialHandleInputChange,
  onSocialPlatformChange,
  settings,
  socialHandleInput,
  socialPlatform,
}: BusinessSocialSectionProps) {
  const BusinessHandleIcon = socialPlatformIcon.Instagram

  return (
    <section className="clay-card business-form-card">
      <p className="business-form-card-title row gap-6"><BusinessHandleIcon size={15} />Social Handles</p>
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

      {settings.businessInfo.socialHandles.length ? (
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
      ) : null}
    </section>
  )
}
