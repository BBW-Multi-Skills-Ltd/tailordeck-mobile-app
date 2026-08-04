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
  onSaveDetails,
  onUpdatePassword,
  passwordDraft,
  profilePhoneLocalPart,
  securityFeedback,
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
    onSaveDetails,
    onUpdatePassword,
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
        checks={state.passwordChecks}
        confirmPasswordDraft={confirmPasswordDraft}
        confirmState={state.passwordConfirmState}
        passwordDirty={state.passwordDirty}
        passwordDraft={passwordDraft}
        passwordReady={state.passwordReady}
        passwordSavedFlash={state.passwordSavedFlash}
        passwordSaving={state.passwordSaving}
        passwordStrength={state.passwordStrength}
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

      <AccountControlsSection feedback={securityFeedback} onDanger={onDanger} />
    </div>
  )
}
