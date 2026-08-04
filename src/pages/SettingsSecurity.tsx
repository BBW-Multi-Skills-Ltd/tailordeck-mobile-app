import AccountSecurityPanel from '../components/settings/AccountSecurityPanel'
import ProfileSettingsPanel from '../components/settings/ProfileSettingsPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

export default function SettingsSecurity() {
  const { actions, derived, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Account & Security"
        centered
        leading={<HistoryBackButton fallbackTo="/settings" />}
      />

      <article className="clay-card settings-standalone-card">
        <ProfileSettingsPanel
          settings={state.settings}
          saved={state.savedSection === 'Profile Avatar' && Boolean(state.savedTick)}
          onAvatarUpload={(event) => actions.uploadSettingsImage('avatarUrl', event)}
          onSavePhoto={() => actions.markSaved('Profile Avatar')}
        />
      </article>

      <AccountSecurityPanel
        settings={state.settings}
        profilePhoneLocalPart={derived.profilePhoneLocalPart}
        passwordDraft={state.passwordDraft}
        confirmPasswordDraft={state.confirmPasswordDraft}
        securityFeedback={state.securityFeedback}
        onFullNameChange={(fullName) => actions.setSettings((prev) => ({ ...prev, profile: { ...prev.profile, fullName } }))}
        onEmailChange={(email) => actions.setSettings((prev) => ({ ...prev, profile: { ...prev.profile, email } }))}
        onPhoneChange={actions.handleProfilePhoneChange}
        onPasswordChange={actions.setPasswordDraft}
        onConfirmPasswordChange={actions.setConfirmPasswordDraft}
        onSaveDetails={actions.handleSaveLoginDetails}
        onUpdatePassword={actions.handleUpdatePassword}
        onDanger={actions.handleSecurityDanger}
      />
    </section>
  )
}
