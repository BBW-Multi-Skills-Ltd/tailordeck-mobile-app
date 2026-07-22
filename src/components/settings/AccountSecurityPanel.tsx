import { AccountControlsSection } from './account-security/AccountControlsSection'
import { LoginDetailsSection } from './account-security/LoginDetailsSection'
import { PasswordSecuritySection } from './account-security/PasswordSecuritySection'
import type { AccountSecurityPanelProps } from './account-security/accountSecurityTypes'
import { useAccountSecurityState } from './account-security/useAccountSecurityState'

export default function AccountSecurityPanel({
  confirmPasswordDraft,
  onConfirmPasswordChange,
  onDanger,
  onEmailChange,
  onFullNameChange,
  onPasswordChange,
  onPhoneChange,
  onSave,
  passwordDraft,
  profilePhoneLocalPart,
  settings,
}: AccountSecurityPanelProps) {
  const currentDetails = {
    fullName: settings.profile.fullName,
    email: settings.profile.email,
    phone: profilePhoneLocalPart,
  }
  const { actions, state } = useAccountSecurityState({
    confirmPasswordDraft,
    currentDetails,
    onConfirmPasswordChange,
    onPasswordChange,
    onSave,
    passwordDraft,
  })

  return (
    <div className="stack gap-7 settings-profile-grouped-form">
      <LoginDetailsSection
        detailsSavedFlash={state.detailsSavedFlash}
        email={settings.profile.email}
        fullName={settings.profile.fullName}
        isEditingDetails={state.isEditingDetails}
        phoneLocalPart={profilePhoneLocalPart}
        onDetailsAction={actions.handleDetailsAction}
        onEmailChange={onEmailChange}
        onFullNameChange={onFullNameChange}
        onPhoneChange={onPhoneChange}
      />

      <PasswordSecuritySection
        confirmPasswordDraft={confirmPasswordDraft}
        passwordDirty={state.passwordDirty}
        passwordDraft={passwordDraft}
        passwordSavedFlash={state.passwordSavedFlash}
        passwordSaving={state.passwordSaving}
        showConfirmPassword={state.showConfirmPassword}
        showNewPassword={state.showNewPassword}
        showPasswordForm={state.showPasswordForm}
        onConfirmPasswordChange={onConfirmPasswordChange}
        onPasswordChange={onPasswordChange}
        onPasswordUpdate={actions.handlePasswordUpdate}
        onShowConfirmPasswordChange={actions.setShowConfirmPassword}
        onShowNewPasswordChange={actions.setShowNewPassword}
        onShowPasswordFormChange={actions.setShowPasswordForm}
      />

      <AccountControlsSection onDanger={onDanger} />
    </div>
  )
}
