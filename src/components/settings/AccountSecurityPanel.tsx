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
  onConfirmEmailChange,
  onFullNameChange,
  onPasswordChange,
  onPhoneChange,
  onRequestDetailsCode,
  onRequestPasswordCode,
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
    onConfirmEmailChange,
    onPasswordChange,
    onRequestDetailsCode,
    onRequestPasswordCode,
    onSaveDetails,
    onUpdatePassword,
    passwordDraft,
  })

  return (
    <div className="stack gap-7 settings-profile-grouped-form">
      <LoginDetailsSection
        detailsSavedFlash={state.detailsSavedFlash}
        detailsCodeFeedback={state.detailsCodeFeedback}
        detailsSaving={state.detailsSaving}
        emailConfirmCode={state.emailConfirmCode}
        emailCurrentCode={state.emailCurrentCode}
        emailCurrentConfirmed={state.emailCurrentConfirmed}
        emailConfirming={state.emailConfirming}
        emailChangeCurrentEmail={state.emailChangeCurrentEmail}
        emailChangePendingEmail={state.emailChangePendingEmail}
        email={settings.profile.email}
        emailChanged={state.emailChanged}
        fullName={settings.profile.fullName}
        isEditingDetails={state.isEditingDetails}
        phoneLocalPart={profilePhoneLocalPart}
        onDetailsAction={actions.handleDetailsAction}
        onEmailConfirmAction={actions.handleConfirmEmailChange}
        onEmailConfirmCodeChange={actions.setEmailConfirmCode}
        onEmailCurrentCodeChange={actions.setEmailCurrentCode}
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
        passwordCode={state.passwordCode}
        passwordCodeRequested={state.passwordCodeRequested}
        passwordCodeFeedback={state.passwordCodeFeedback}
        passwordCodeRequesting={state.passwordCodeRequesting}
        passwordStrength={state.passwordStrength}
        showConfirmPassword={state.showConfirmPassword}
        showNewPassword={state.showNewPassword}
        showPasswordForm={state.showPasswordForm}
        onConfirmPasswordChange={onConfirmPasswordChange}
        onPasswordChange={onPasswordChange}
        onPasswordCodeChange={actions.setPasswordCode}
        onRequestPasswordCode={actions.handleRequestPasswordCode}
        onPasswordUpdate={actions.handlePasswordUpdate}
        onShowConfirmPasswordChange={actions.setShowConfirmPassword}
        onShowNewPasswordChange={actions.setShowNewPassword}
        onShowPasswordFormChange={actions.setShowPasswordForm}
      />

      <AccountControlsSection feedback={securityFeedback} onDanger={onDanger} />
    </div>
  )
}
