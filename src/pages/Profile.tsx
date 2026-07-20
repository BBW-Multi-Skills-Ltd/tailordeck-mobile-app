import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import AccountSecurityPanel from '../components/settings/AccountSecurityPanel'
import ProfileSettingsPanel from '../components/settings/ProfileSettingsPanel'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import PageHeader from '../components/shared/PageHeader'

export default function Profile() {
  const { actions, derived, state } = useSettingsPage()

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Profile"
        centered
        leading={
          <Link to="/more" className="btn btn-ghost btn-icon" aria-label="Back to more">
            <ArrowLeft size={18} />
          </Link>
        }
      />

      <article className="clay-card settings-standalone-card">
        <ProfileSettingsPanel
          settings={state.settings}
          saved={state.savedSection === 'Profile Avatar' && Boolean(state.savedTick)}
          onAvatarUpload={(event) => actions.uploadSettingsImage('avatarUrl', event)}
          onSavePhoto={() => actions.markSaved('Profile Avatar')}
        />
      </article>

      <div>
        <AccountSecurityPanel
          settings={state.settings}
          layout="grouped"
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
      </div>
    </section>
  )
}
