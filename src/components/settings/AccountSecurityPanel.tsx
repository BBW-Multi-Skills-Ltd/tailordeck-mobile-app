import { KeyRound, ShieldAlert, Trash2 } from 'lucide-react'
import type { TailorSettings } from '../../lib/settings'

type AccountSecurityPanelProps = {
  settings: TailorSettings
  profilePhoneLocalPart: string
  passwordDraft: string
  confirmPasswordDraft: string
  securityFeedback: string
  saved: boolean
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSave: () => void
  onDanger: (kind: 'deactivate' | 'delete') => void
}

export default function AccountSecurityPanel({
  settings,
  profilePhoneLocalPart,
  passwordDraft,
  confirmPasswordDraft,
  securityFeedback,
  saved,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSave,
  onDanger,
}: AccountSecurityPanelProps) {
  return (
    <div className="stack settings-security-form">
      <p className="settings-help-text">Update your account identity here. Password and login security will be connected to Supabase Auth during backend wiring.</p>

      <div className="input-group settings-profile-field">
        <label className="settings-profile-label">Full Name</label>
        <input className="input settings-profile-input" value={settings.profile.fullName} onChange={(event) => onFullNameChange(event.target.value)} />
      </div>

      <div className="input-group settings-profile-field">
        <label className="settings-profile-label">Login Email</label>
        <input className="input settings-profile-input" type="email" value={settings.profile.email} onChange={(event) => onEmailChange(event.target.value)} />
      </div>

      <div className="input-group settings-profile-field">
        <label className="settings-profile-label">Login Phone</label>
        <div className="settings-phone-input-wrap">
          <span className="settings-phone-prefix">+234</span>
          <input className="input settings-profile-input settings-phone-input" inputMode="numeric" placeholder="8012345678" value={profilePhoneLocalPart} onChange={(event) => onPhoneChange(event.target.value)} />
        </div>
      </div>

      <div className="input-group settings-profile-field">
        <label className="settings-profile-label row gap-8">
          <KeyRound size={15} className="settings-security-icon" />
          New Password
        </label>
        <input className="input settings-profile-input" type="password" placeholder="Create a new password" value={passwordDraft} onChange={(event) => onPasswordChange(event.target.value)} />
      </div>

      <div className="input-group settings-profile-field">
        <label className="settings-profile-label">Confirm Password</label>
        <input className="input settings-profile-input" type="password" placeholder="Confirm new password" value={confirmPasswordDraft} onChange={(event) => onConfirmPasswordChange(event.target.value)} />
      </div>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Account Changes
      </button>
      {saved ? <p className="text-sm text-success">Account changes saved locally.</p> : null}

      <div className="settings-danger-zone stack gap-8">
        <div className="stack gap-3">
          <p className="settings-danger-zone-title">Danger zone</p>
          <p className="settings-danger-zone-copy">
            These actions affect account access. They are placeholders until Supabase account controls are fully connected.
          </p>
        </div>
        <button type="button" className="settings-security-danger-btn" onClick={() => onDanger('deactivate')}>
          <ShieldAlert size={15} />
          Deactivate Account
        </button>
        <button type="button" className="settings-security-danger-btn permanent" onClick={() => onDanger('delete')}>
          <Trash2 size={15} />
          Delete Account Permanently
        </button>
      </div>

      {securityFeedback ? <p className="text-sm text-success">{securityFeedback}</p> : null}
    </div>
  )
}
