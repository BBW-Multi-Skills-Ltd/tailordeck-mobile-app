import { CheckCircle2, ChevronDown, Eye, EyeOff, KeyRound, Mail, Phone, ShieldAlert, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'
import type { TailorSettings } from '../../lib/settings'

type AccountSecurityPanelProps = {
  settings: TailorSettings
  layout?: 'stacked' | 'grouped'
  mode?: 'profile' | 'security' | 'full'
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
  onSave: () => void | Promise<void>
  onDanger: (kind: 'deactivate' | 'delete') => void
}

export default function AccountSecurityPanel({
  settings,
  layout = 'stacked',
  mode = 'full',
  profilePhoneLocalPart,
  passwordDraft,
  confirmPasswordDraft,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSave,
  onDanger,
}: AccountSecurityPanelProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [detailsSavedFlash, setDetailsSavedFlash] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSavedFlash, setPasswordSavedFlash] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const currentDetails = {
    fullName: settings.profile.fullName,
    email: settings.profile.email,
    phone: profilePhoneLocalPart,
  }
  const [savedDetails, setSavedDetails] = useState(currentDetails)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const detailsDirty =
    currentDetails.fullName !== savedDetails.fullName ||
    currentDetails.email !== savedDetails.email ||
    currentDetails.phone !== savedDetails.phone
  const passwordDirty = passwordDraft.trim().length > 0 || confirmPasswordDraft.trim().length > 0
  const showFullName = true
  const showSensitiveSections = mode !== 'profile'
  const detailsTitle = mode === 'security' ? 'Login Details' : 'Personal Details'

  function handleDetailsAction() {
    if (!isEditingDetails) {
      setSavedDetails(currentDetails)
      setIsEditingDetails(true)
      return
    }

    if (!detailsDirty) {
      setIsEditingDetails(false)
      return
    }

    onSave()
    setSavedDetails(currentDetails)
    setIsEditingDetails(false)
    setDetailsSavedFlash(true)
    window.setTimeout(() => setDetailsSavedFlash(false), 1200)
  }

  async function handlePasswordUpdate() {
    if (!passwordDirty || passwordSaving || passwordSavedFlash) return

    setPasswordSaving(true)
    try {
      await onSave()
      setPasswordSavedFlash(true)
      window.setTimeout(() => {
        setPasswordSavedFlash(false)
        setShowPasswordForm(false)
        onPasswordChange('')
        onConfirmPasswordChange('')
        setShowNewPassword(false)
        setShowConfirmPassword(false)
      }, 1100)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (layout === 'grouped') {
    return (
      <div className="stack gap-7 settings-profile-grouped-form">
        <section className="stack gap-8">
          <p className="more-group-title">{detailsTitle}</p>
          <div className="clay-card more-group-card profile-settings-form-card">
            {showFullName ? (
              <div className="profile-settings-form-row">
                <span className="more-row-icon clay-inset">
                  <UserRound size={17} />
                </span>
                <label>Full Name</label>
                <input className="input profile-settings-form-input" value={settings.profile.fullName} disabled={!isEditingDetails} onChange={(event) => onFullNameChange(event.target.value)} />
                <span className="more-row-divider" aria-hidden />
              </div>
            ) : null}

            <div className="profile-settings-form-row">
              <span className="more-row-icon clay-inset">
                <Mail size={17} />
              </span>
              <label>Email</label>
              <input className="input profile-settings-form-input" type="email" value={settings.profile.email} disabled={!isEditingDetails} onChange={(event) => onEmailChange(event.target.value)} />
              <span className="more-row-divider" aria-hidden />
            </div>

            <div className="profile-settings-form-row">
              <span className="more-row-icon clay-inset">
                <Phone size={17} />
              </span>
              <label>Phone</label>
              <div className="settings-phone-input-wrap profile-settings-form-phone">
                <span className="settings-phone-prefix">+234</span>
                <input className="input profile-settings-form-input profile-settings-phone-input" inputMode="numeric" placeholder="8012345678" value={profilePhoneLocalPart} disabled={!isEditingDetails} onChange={(event) => onPhoneChange(event.target.value)} />
              </div>
            </div>
          </div>

          <button type="button" className={`btn btn-primary settings-panel-save-btn profile-settings-save-btn${detailsSavedFlash ? ' profile-settings-action-saved' : ''}`} onClick={handleDetailsAction}>
            {detailsSavedFlash ? (
              <>
                <CheckCircle2 size={15} />
                Saved
              </>
            ) : isEditingDetails ? (
              'Save Changes'
            ) : (
              'Edit Details'
            )}
            </button>
        </section>

        {showSensitiveSections ? (
          <>
            <section className="stack gap-8">
              <p className="more-group-title">Password & Security</p>
              <div className="clay-card more-group-card profile-settings-form-card">
                <button type="button" className="profile-settings-control-row" onClick={() => setShowPasswordForm((value) => !value)}>
                  <span className="more-row-icon clay-inset">
                    <KeyRound size={17} />
                  </span>
                  <span className="stack gap-2 min-w-0 flex-1">
                    <span className="more-row-label">Change Password</span>
                    <span className="more-row-desc">Update your login password safely.</span>
                  </span>
                  <ChevronDown size={17} className={`more-row-chevron profile-settings-chevron${showPasswordForm ? ' open' : ''}`} />
                </button>

                {showPasswordForm ? (
                  <div className="profile-settings-password-panel">
                    <div className="input-group settings-profile-field">
                      <label className="settings-profile-label">New Password</label>
                      <div className="auth-password-wrap">
                        <input className="input settings-profile-input auth-input-password" type={showNewPassword ? 'text' : 'password'} placeholder="Create password" value={passwordDraft} onChange={(event) => onPasswordChange(event.target.value)} />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowNewPassword((value) => !value)}
                        >
                          {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="input-group settings-profile-field">
                      <label className="settings-profile-label">Confirm Password</label>
                      <div className="auth-password-wrap">
                        <input className="input settings-profile-input auth-input-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPasswordDraft} onChange={(event) => onConfirmPasswordChange(event.target.value)} />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowConfirmPassword((value) => !value)}
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`btn btn-primary settings-panel-save-btn profile-settings-save-btn profile-settings-update-btn${passwordSavedFlash ? ' profile-settings-action-saved' : ''}`}
                      disabled={!passwordDirty || passwordSaving || passwordSavedFlash}
                      onClick={handlePasswordUpdate}
                    >
                      {passwordSaving ? (
                        'Updating...'
                      ) : passwordSavedFlash ? (
                        <>
                          <CheckCircle2 size={15} />
                          Updated
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="stack gap-8">
              <p className="more-group-title">Account Controls</p>
              <div className="clay-card more-group-card">
                <button type="button" className="profile-settings-control-row danger" onClick={() => onDanger('deactivate')}>
                  <span className="more-row-icon clay-inset">
                    <ShieldAlert size={17} />
                  </span>
                  <span className="more-row-label">Deactivate Account</span>
                  <span className="more-row-divider" aria-hidden />
                </button>
                <button type="button" className="profile-settings-control-row danger permanent" onClick={() => onDanger('delete')}>
                  <span className="more-row-icon clay-inset">
                    <Trash2 size={17} />
                  </span>
                  <span className="more-row-label">Delete Account Permanently</span>
                </button>
              </div>
            </section>
          </>
        ) : null}
      </div>
    )
  }

  return (
    <div className="stack settings-security-form">
      <div className="settings-profile-edit-section stack gap-10">
        <div className="settings-profile-section-heading">
          <p>Personal Details</p>
        </div>

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
      </div>

      <div className="settings-profile-edit-section stack gap-10">
        <div className="settings-profile-section-heading">
          <p>Password</p>
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
      </div>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Account Changes
      </button>

      <div className="settings-danger-zone stack gap-8">
        <div className="stack gap-3">
          <p className="settings-danger-zone-title">Account Controls</p>
          <p className="settings-danger-zone-copy">
            Use these only when you want to pause or permanently remove this account.
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

    </div>
  )
}

