import { Camera } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { AVATAR_PLACEHOLDER, type TailorSettings } from '../../lib/settings'

type ProfileSettingsPanelProps = {
  settings: TailorSettings
  saved: boolean
  onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSavePhoto: () => void
  onEditProfile: () => void
}

export default function ProfileSettingsPanel({ settings, saved, onAvatarUpload, onSavePhoto, onEditProfile }: ProfileSettingsPanelProps) {
  return (
    <div className="stack gap-14 settings-profile-summary-panel">
      <div className="settings-profile-summary">
        <div className="settings-profile-avatar-large">
          <img src={settings.profile.avatarUrl || AVATAR_PLACEHOLDER} alt="Profile avatar" />
          <label className="settings-profile-avatar-camera" aria-label="Upload profile avatar">
            <Camera size={14} />
            <input type="file" accept="image/*" className="settings-brand-upload-input" onChange={onAvatarUpload} />
          </label>
        </div>

        <div className="settings-profile-summary-copy">
          <h3>{settings.profile.fullName || 'Your Name'}</h3>
          <p>{settings.profile.email || 'your@email.com'}</p>
          <p>{settings.businessInfo.shopName || settings.brand.name || 'Your shop name'}</p>
          <div className="settings-profile-summary-actions">
            <button type="button" className="settings-profile-edit-btn save-photo" onClick={onSavePhoto}>
              Save Photo
            </button>
            <button type="button" className="settings-profile-edit-btn" onClick={onEditProfile}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      {saved ? <p className="text-sm text-success">Profile avatar saved.</p> : null}
    </div>
  )
}
