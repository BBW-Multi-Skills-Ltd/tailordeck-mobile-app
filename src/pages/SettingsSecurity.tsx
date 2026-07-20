import AccountSecurityPanel from '../components/settings/AccountSecurityPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'

export default function SettingsSecurity() {
  const { actions, derived, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader title="Account Security" centered />

      <article className="clay-card settings-standalone-card">
        <AccountSecurityPanel
          settings={state.settings}
          profilePhoneLocalPart={derived.profilePhoneLocalPart}
          passwordDraft={state.passwordDraft}
          confirmPasswordDraft={state.confirmPasswordDraft}
          securityFeedback={state.securityFeedback}
          saved={state.savedSection === 'Account & Security' && Boolean(state.savedTick)}
          onFullNameChange={(fullName) => actions.setSettings((prev) => ({ ...prev, profile: { ...prev.profile, fullName } }))}
          onEmailChange={(email) => actions.setSettings((prev) => ({ ...prev, profile: { ...prev.profile, email } }))}
          onPhoneChange={actions.handleProfilePhoneChange}
          onPasswordChange={actions.setPasswordDraft}
          onConfirmPasswordChange={actions.setConfirmPasswordDraft}
          onSave={actions.handleSaveAccountSecurity}
          onDanger={actions.handleSecurityDanger}
        />
      </article>
    </section>
  )
}
