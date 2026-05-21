import {
  BellRing,
  Building2,
  ChevronRight,
  CircleHelp,
  Database,
  LogOut,
  Moon,
  Palette,
  Store,
  UserRound,
  WandSparkles,
} from 'lucide-react'
import type { IconType } from 'react-icons'
import { FiBell, FiBellOff, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useState, type ChangeEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  loadTailorSettings,
  saveTailorSettings,
  type MaterialQuality,
  type NotificationBellOption,
  type ReminderLead,
  type RingtoneOption,
  type TailorSettings,
} from '../lib/settings'

type SettingsPanel = 'profile' | 'preferences' | 'reminders' | 'business' | 'brand' | 'about' | null

const ringtoneOptions: Array<{ value: RingtoneOption; icon: IconType }> = [
  { value: 'Classic Ring', icon: FiVolume2 },
  { value: 'Soft Chime', icon: FiVolume1 },
  { value: 'Pulse Tone', icon: FiVolumeX },
]

const notificationBellOptions: Array<{ value: NotificationBellOption; icon: IconType }> = [
  { value: 'Standard Bell', icon: FiBell },
  { value: 'Soft Bell', icon: FiVolume1 },
  { value: 'Sharp Bell', icon: FiBellOff },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      className={`settings-toggle${checked ? ' active' : ''}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-toggle-knob" />
    </button>
  )
}

function SettingAccordion({
  icon,
  title,
  subtitle,
  panelKey,
  panel,
  onToggle,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  panelKey: Exclude<SettingsPanel, null>
  panel: SettingsPanel
  onToggle: (key: Exclude<SettingsPanel, null>) => void
  children: ReactNode
}) {
  const isOpen = panel === panelKey

  return (
    <div className="settings-accordion-item">
      <button type="button" className="settings-row-card" onClick={() => onToggle(panelKey)} aria-expanded={isOpen}>
        <div className="row gap-4">
          <span className="settings-row-icon">{icon}</span>
          <div className="stack gap-4">
            <p className="settings-row-title">{title}</p>
            {subtitle ? <p className="settings-row-subtitle">{subtitle}</p> : null}
          </div>
        </div>
        <ChevronRight size={17} className={`text-muted settings-row-chevron${isOpen ? ' open' : ''}`} />
      </button>

      {isOpen ? <div className="settings-accordion-panel">{children}</div> : null}
    </div>
  )
}

function SettingLinkRow({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  href: string
}) {
  return (
    <Link to={href} className="settings-row-card">
      <div className="row gap-4">
        <span className="settings-row-icon">{icon}</span>
        <div className="stack gap-4">
          <p className="settings-row-title">{title}</p>
          {subtitle ? <p className="settings-row-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <ChevronRight size={17} className="text-muted" />
    </Link>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<TailorSettings>(() => loadTailorSettings())
  const [panel, setPanel] = useState<SettingsPanel>(null)
  const [savedTick, setSavedTick] = useState(0)
  const profilePhoneLocalPart = settings.profile.phone.replace(/^\+234/, '').replace(/\D/g, '')

  function handleSaveSettings() {
    const next = saveTailorSettings(settings)
    setSettings(next)
    setSavedTick(Date.now())
  }

  function updateColor(index: 0 | 1 | 2, value: string) {
    setSettings((prev) => {
      const colors: [string, string, string] = [...prev.brand.colors] as [string, string, string]
      colors[index] = value
      return { ...prev, brand: { ...prev.brand, colors } }
    })
  }

  function onInput(handler: (value: string) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handler(event.target.value)
  }

  function handleProfilePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, '')
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, phone: `+234${digitsOnly}` } }))
  }

  function clearJobHistory() {
    const confirmed = window.confirm('Clear all job history data? This action cannot be undone once backend is connected.')
    if (!confirmed) return
    window.localStorage.removeItem('tailordeck-job-history')
    window.localStorage.removeItem('tailordeck-jobs')
    window.alert('Job history cleared locally.')
  }

  function handleToggle(next: Exclude<SettingsPanel, null>) {
    setPanel((prev) => (prev === next ? null : next))
  }

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <h1 className="settings-page-title">Settings</h1>
        <button type="button" className="btn btn-ghost btn-icon settings-theme-btn" aria-label="Theme mode (coming soon)">
          <Moon size={20} />
        </button>
      </header>

      <div className="settings-list">
        <SettingAccordion icon={<UserRound size={20} />} title="My Profile" panelKey="profile" panel={panel} onToggle={handleToggle}>
          <div className="stack gap-14 settings-profile-form">
            <div className="input-group settings-profile-field">
              <label className="settings-profile-label">Full Name</label>
              <input className="input settings-profile-input" value={settings.profile.fullName} onChange={onInput((value) => setSettings((prev) => ({ ...prev, profile: { ...prev.profile, fullName: value } })))} />
            </div>
            <div className="input-group settings-profile-field">
              <label className="settings-profile-label">Email</label>
              <input className="input settings-profile-input" value={settings.profile.email} onChange={onInput((value) => setSettings((prev) => ({ ...prev, profile: { ...prev.profile, email: value } })))} />
            </div>
            <div className="input-group settings-profile-field">
              <label className="settings-profile-label">Phone</label>
              <div className="settings-phone-input-wrap">
                <span className="settings-phone-prefix">+234</span>
                <input
                  className="input settings-profile-input settings-phone-input"
                  inputMode="numeric"
                  placeholder="8012345678"
                  value={profilePhoneLocalPart}
                  onChange={(event) => handleProfilePhoneChange(event.target.value)}
                />
              </div>
            </div>
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Store size={20} />} title="Shop Preferences" panelKey="preferences" panel={panel} onToggle={handleToggle}>
          <div className="stack settings-pref-form">
            <div className="stack settings-pref-group">
              <p className="settings-pref-label">Default Measurement Unit</p>
              <div className="settings-pref-unit-grid">
                {(['cm', 'inches'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    className={`settings-pref-unit-btn settings-choice-pill${settings.preferences.measurementUnit === unit ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, measurementUnit: unit } }))}
                  >
                    {unit === 'cm' ? 'Centimeters' : 'Inches'}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group settings-pref-group">
              <p className="settings-pref-label">Default Material Quality</p>
              <div className="settings-pref-quality-wrap">
                {(['Normal', 'Original', 'Fake', 'High Standard'] as MaterialQuality[]).map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    className={`settings-pref-quality-btn settings-choice-pill${settings.preferences.defaultMaterialQuality === quality ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, defaultMaterialQuality: quality } }))}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<BellRing size={20} />} title="Reminders & Notifications" panelKey="reminders" panel={panel} onToggle={handleToggle}>
          <div className="stack settings-reminder-form">
            <div className="row-between settings-reminder-row">
              <div className="stack gap-4">
                <p className="settings-reminder-label">Push Notifications</p>
                <p className="settings-reminder-help">Phone pop-up alerts for deadlines and updates.</p>
              </div>
              <Toggle checked={settings.reminders.pushNotifications} onChange={(next) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, pushNotifications: next } }))} />
            </div>

            <div className="stack settings-reminder-group">
              <div className="row-between settings-reminder-row">
                <div className="stack gap-4">
                  <p className="settings-reminder-label">Notification Bell Sound</p>
                  <p className="settings-reminder-help">Choose the alert bell tone for phone notifications.</p>
                </div>
                <Toggle
                  checked={settings.reminders.notificationBellEnabled}
                  onChange={(next) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBellEnabled: next } }))}
                />
              </div>
              <div className="settings-radio-list">
                {notificationBellOptions.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`settings-radio-option${settings.reminders.notificationBell === value ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBell: value } }))}
                    disabled={!settings.reminders.pushNotifications || !settings.reminders.notificationBellEnabled}
                  >
                    <span className="settings-radio-indicator" />
                    <Icon size={16} className="settings-radio-icon" />
                    <span className="settings-radio-title">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="stack settings-reminder-group">
              <p className="settings-reminder-label">Default Reminder</p>
              <div className="settings-reminder-chip-row">
                {(['1 day before', '3 days before', '1 week before'] as ReminderLead[]).map((reminder) => (
                  <button
                    key={reminder}
                    type="button"
                    className={`settings-reminder-chip settings-choice-pill${settings.reminders.defaultReminder === reminder ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultReminder: reminder } }))}
                  >
                    {reminder}
                  </button>
                ))}
              </div>
            </div>

            <div className="stack settings-reminder-group">
              <div className="row-between settings-reminder-row">
                <div className="stack gap-4">
                  <p className="settings-reminder-label">Ringtone</p>
                  <p className="settings-reminder-help">Play sound when a reminder alert is delivered.</p>
                </div>
                <Toggle checked={settings.reminders.ringtoneEnabled} onChange={(next) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtoneEnabled: next } }))} />
              </div>
              <div className="settings-radio-list">
                {ringtoneOptions.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`settings-radio-option${settings.reminders.ringtone === value ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtone: value } }))}
                    disabled={!settings.reminders.pushNotifications || !settings.reminders.ringtoneEnabled}
                  >
                    <span className="settings-radio-indicator" />
                    <Icon size={16} className="settings-radio-icon" />
                    <span className="settings-radio-title">{value}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Building2 size={20} />} title="Business Info" panelKey="business" panel={panel} onToggle={handleToggle}>
          <div className="stack gap-12">
            <div className="input-group">
              <label className="input-label">Shop Name</label>
              <input
                className="input"
                placeholder="Your shop name"
                value={settings.businessInfo.shopName}
                onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopName: value } })))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Shop Address</label>
              <textarea className="input settings-textarea" value={settings.businessInfo.shopAddress} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopAddress: value } })))} />
            </div>
            <div className="input-group">
              <label className="input-label">Business Phone</label>
              <input className="input" value={settings.businessInfo.businessPhone} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessPhone: value } })))} />
            </div>
            <div className="input-group">
              <label className="input-label">Instagram Handle</label>
              <input className="input" value={settings.businessInfo.instagramHandle} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, instagramHandle: value } })))} />
            </div>
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Palette size={20} />} title="Brand & Invoice Setup" panelKey="brand" panel={panel} onToggle={handleToggle}>
          <div className="stack gap-12">
            <div className="input-group">
              <label className="input-label">Business / Brand Name</label>
              <input className="input" value={settings.brand.name} onChange={onInput((value) => setSettings((prev) => ({ ...prev, brand: { ...prev.brand, name: value } })))} />
            </div>
            <div className="stack gap-8">
              <p className="input-label">Brand Colors (up to 3)</p>
              <div className="settings-color-grid">
                <div className="input-group">
                  <label className="input-label">Primary</label>
                  <input type="color" className="settings-color-input" value={settings.brand.colors[0]} onChange={onInput((value) => updateColor(0, value))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Secondary</label>
                  <input type="color" className="settings-color-input" value={settings.brand.colors[1]} onChange={onInput((value) => updateColor(1, value))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Accent</label>
                  <input type="color" className="settings-color-input" value={settings.brand.colors[2]} onChange={onInput((value) => updateColor(2, value))} />
                </div>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Business Logo URL</label>
              <input className="input" value={settings.brand.logoUrl} onChange={onInput((value) => setSettings((prev) => ({ ...prev, brand: { ...prev.brand, logoUrl: value } })))} placeholder="Upload path or URL" />
            </div>
            <div className="input-group">
              <label className="input-label">Business Signature URL</label>
              <input className="input" value={settings.brand.signatureUrl} onChange={onInput((value) => setSettings((prev) => ({ ...prev, brand: { ...prev.brand, signatureUrl: value } })))} placeholder="Upload path or URL" />
            </div>
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<CircleHelp size={20} />} title="About TailorDeck" panelKey="about" panel={panel} onToggle={handleToggle}>
          <div className="stack gap-8">
            <p className="text-base font-semibold">Version 1.0.0</p>
            <p className="text-sm text-muted">Your shop, in your pocket.</p>
            <p className="text-sm text-muted">Built with love for tailors and fashion designers.</p>
          </div>
        </SettingAccordion>

        <SettingLinkRow
          icon={<WandSparkles size={20} />}
          title="Upgrade"
          subtitle={`Currently on ${settings.subscription.plan === 'free' ? 'Free' : settings.subscription.plan}`}
          href="/settings/subscription"
        />
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary btn-full settings-save-btn" onClick={handleSaveSettings}>
          Save Settings
        </button>
        {savedTick ? <p className="text-sm text-success">Saved successfully.</p> : null}
        <button type="button" className="btn btn-secondary btn-full settings-clear-btn settings-clear-btn-shape" onClick={clearJobHistory}>
          <Database size={18} />
          Clear Job History
        </button>
        <button type="button" className="settings-signout-link">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </section>
  )
}
