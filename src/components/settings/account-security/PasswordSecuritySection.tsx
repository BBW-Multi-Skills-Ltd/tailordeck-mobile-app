import { CheckCircle2, ChevronDown, Eye, EyeOff, KeyRound } from 'lucide-react'

type PasswordSecuritySectionProps = {
  confirmPasswordDraft: string
  passwordDirty: boolean
  passwordDraft: string
  passwordSavedFlash: boolean
  passwordSaving: boolean
  showConfirmPassword: boolean
  showNewPassword: boolean
  showPasswordForm: boolean
  onConfirmPasswordChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onPasswordUpdate: () => void
  onShowConfirmPasswordChange: (updater: (value: boolean) => boolean) => void
  onShowNewPasswordChange: (updater: (value: boolean) => boolean) => void
  onShowPasswordFormChange: (updater: (value: boolean) => boolean) => void
}

export function PasswordSecuritySection({
  confirmPasswordDraft,
  onConfirmPasswordChange,
  onPasswordChange,
  onPasswordUpdate,
  onShowConfirmPasswordChange,
  onShowNewPasswordChange,
  onShowPasswordFormChange,
  passwordDirty,
  passwordDraft,
  passwordSavedFlash,
  passwordSaving,
  showConfirmPassword,
  showNewPassword,
  showPasswordForm,
}: PasswordSecuritySectionProps) {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Password & Security</p>
      <div className="clay-card more-group-card profile-settings-form-card">
        <button type="button" className="profile-settings-control-row" onClick={() => onShowPasswordFormChange((value) => !value)}>
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
            <PasswordInput
              label="New Password"
              placeholder="Create password"
              showPassword={showNewPassword}
              value={passwordDraft}
              onChange={onPasswordChange}
              onToggle={() => onShowNewPasswordChange((value) => !value)}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm password"
              showPassword={showConfirmPassword}
              value={confirmPasswordDraft}
              onChange={onConfirmPasswordChange}
              onToggle={() => onShowConfirmPasswordChange((value) => !value)}
            />

            <button
              type="button"
              className={`btn btn-primary settings-panel-save-btn profile-settings-save-btn profile-settings-update-btn${passwordSavedFlash ? ' profile-settings-action-saved' : ''}`}
              disabled={!passwordDirty || passwordSaving || passwordSavedFlash}
              onClick={onPasswordUpdate}
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
  )
}

type PasswordInputProps = {
  label: string
  placeholder: string
  showPassword: boolean
  value: string
  onChange: (value: string) => void
  onToggle: () => void
}

function PasswordInput({ label, onChange, onToggle, placeholder, showPassword, value }: PasswordInputProps) {
  return (
    <div className="input-group settings-profile-field">
      <label className="settings-profile-label">{label}</label>
      <div className="auth-password-wrap">
        <input className="input settings-profile-input auth-input-password" type={showPassword ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
        <button type="button" className="auth-eye-btn" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={onToggle}>
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}
