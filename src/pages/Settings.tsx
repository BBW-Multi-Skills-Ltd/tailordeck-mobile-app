import { BellRing, CheckCircle2, ChevronRight, CircleHelp, Database, LogOut, Moon, ShieldCheck, Sun, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SignOutConfirmDialog from '../components/layout/SignOutConfirmDialog'
import { useSettingsPage } from '../components/settings/useSettingsPage'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'
import { AVATAR_PLACEHOLDER } from '../lib/settings'

type SettingsHubRowProps = {
  icon: typeof BellRing
  title: string
  desc: string
  to?: string
  tone?: 'default' | 'accent' | 'danger'
  onClick?: () => void
}

function SettingsHubRow({ desc, icon: Icon, onClick, title, to, tone = 'default' }: SettingsHubRowProps) {
  const content = (
    <>
      <span className={`more-row-icon clay-inset settings-hub-icon ${tone}`}>
        <Icon size={18} />
      </span>
      <span className="stack gap-2 min-w-0 flex-1">
        <span className={`more-row-label settings-hub-label ${tone}`}>{title}</span>
        <span className="more-row-desc">{desc}</span>
      </span>
      <ChevronRight size={17} className="more-row-chevron" />
    </>
  )

  if (to) {
    return (
      <Link to={to} className="more-row">
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className="more-row" onClick={onClick}>
      {content}
    </button>
  )
}

export default function SettingsPage() {
  const { actions, state } = useSettingsPage()
  const [historyCleared, setHistoryCleared] = useState(false)
  const { settings } = state
  const fullName = settings.profile.fullName || 'TailorDeck User'
  const email = settings.profile.email || 'Complete your profile'
  const initial = fullName.trim().charAt(0).toUpperCase() || 'T'

  useEffect(() => {
    if (!historyCleared) return
    const timer = window.setTimeout(() => setHistoryCleared(false), 3200)
    return () => window.clearTimeout(timer)
  }, [historyCleared])

  async function handleClearJobHistory(): Promise<void> {
    const cleared = await actions.clearJobHistory()
    if (cleared) setHistoryCleared(true)
  }

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="Settings"
        centered
        leading={<HistoryBackButton fallbackTo="/more" />}
        trailing={(
          <button type="button" className="btn btn-ghost btn-icon settings-theme-btn" aria-label={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={actions.setTheme}>
            {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      />
      {state.settingsError ? <p className="inline-feedback-error" role="alert">{state.settingsError}</p> : null}

      <Link to="/settings/security" className="clay-card more-profile-card settings-profile-top-card">
        <div className="more-avatar clay-inset" aria-hidden>
          {settings.profile.avatarUrl ? <img src={settings.profile.avatarUrl || AVATAR_PLACEHOLDER} alt="" /> : <span>{initial}</span>}
        </div>
        <div className="stack gap-2 min-w-0">
          <p className="more-profile-name truncate">{fullName}</p>
          <p className="more-profile-email truncate">{email}</p>
        </div>
        <ChevronRight size={17} className="more-row-chevron more-profile-chevron" />
      </Link>

      <div className="stack gap-7">
        <section className="stack gap-8">
          <p className="more-group-title">App</p>
          <div className="clay-card more-group-card">
            <SettingsHubRow icon={BellRing} title="Reminders & Notifications" desc="Push alerts and delivery reminder timing." to="/settings/reminders" />
            <span className="more-row-divider settings-hub-divider" aria-hidden />
            <SettingsHubRow icon={WandSparkles} title="Upgrade" desc={`Currently on ${settings.subscription.plan === 'free' ? 'Free' : settings.subscription.plan}.`} to="/settings/subscription" tone="accent" />
          </div>
        </section>

        <section className="stack gap-8">
          <p className="more-group-title">Account</p>
          <div className="clay-card more-group-card">
            <SettingsHubRow icon={ShieldCheck} title="Account & Security" desc="Login details, password, phone, and account controls." to="/settings/security" tone="danger" />
            <span className="more-row-divider settings-hub-divider" aria-hidden />
            <SettingsHubRow icon={CircleHelp} title="About TailorDeck" desc="Version, product info, and app details." to="/settings/about" />
          </div>
        </section>

        <section className="stack gap-8">
          <p className="more-group-title">Session</p>
          <div className="clay-card more-group-card">
            <SettingsHubRow icon={Database} title="Clear Job History" desc="Remove local job history from this device." onClick={() => void handleClearJobHistory()} tone="danger" />
            {historyCleared ? (
              <div className="settings-inline-success" role="status">
                <CheckCircle2 size={15} />
                <span>Job history cleared</span>
              </div>
            ) : null}
            <span className="more-row-divider settings-hub-divider" aria-hidden />
            <SettingsHubRow icon={LogOut} title="Sign Out" desc="Leave this TailorDeck account on this device." onClick={actions.handleSignOut} />
          </div>
        </section>
      </div>

      {state.signOutConfirmOpen ? (
        <SignOutConfirmDialog
          onCancel={() => actions.setSignOutConfirmOpen(false)}
          onConfirm={() => {
            void actions.confirmSignOut()
          }}
        />
      ) : null}
    </section>
  )
}
