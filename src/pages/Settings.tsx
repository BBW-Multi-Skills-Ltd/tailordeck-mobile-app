import {
  AtSign,
  BellRing,
  Building2,
  CheckSquare,
  ChevronRight,
  CircleHelp,
  Database,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  Sun,
  Palette,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react'
import type { IconType } from 'react-icons'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6'
import { FiBell, FiBellOff, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearPreviewSession } from '../lib/auth'
import { renderTemplate } from '../lib/docTemplates'
import { getSavedTheme, toggleTheme, type AppTheme } from '../lib/theme'
import {
  AVATAR_PLACEHOLDER,
  loadTailorSettings,
  saveTailorSettings,
  type MaterialQuality,
  type NotificationBellOption,
  type ReminderLead,
  type RingtoneOption,
  type SocialPlatform,
  type TailorSettings,
} from '../lib/settings'
import type { DocumentTemplatePayload } from '../templates/types'

type SettingsPanel = 'profile' | 'security' | 'preferences' | 'reminders' | 'business' | 'brand' | 'about' | null

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

const socialPlatforms: SocialPlatform[] = ['Instagram', 'Facebook', 'TikTok']
const socialPlatformIcon: Record<SocialPlatform, IconType> = {
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
  TikTok: FaTiktok,
}
const socialPlatformColor: Record<SocialPlatform, string> = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  TikTok: '#000000',
}

const documentTemplate = { title: 'Classic Wave', subtitle: 'Single template for invoice and receipt' }

const brandColorOptions = [
  '#7B1E37', '#C9A84C', '#1F7A8C', '#2D6A4F',
  '#A63D40', '#3B82F6', '#9333EA', '#111827',
  '#F59E0B', '#EF4444', '#10B981', '#6B7280',
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
  tone = 'default',
  order,
  panelKey,
  panel,
  onToggle,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  tone?: 'default' | 'danger'
  order?: number
  panelKey: Exclude<SettingsPanel, null>
  panel: SettingsPanel
  onToggle: (key: Exclude<SettingsPanel, null>) => void
  children: ReactNode
}) {
  const isOpen = panel === panelKey

  return (
    <div className={`settings-accordion-item${tone === 'danger' ? ' danger' : ''}`} style={order ? { order } : undefined}>
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
  tone = 'default',
  order,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  href: string
  tone?: 'default' | 'accent' | 'danger'
  order?: number
}) {
  return (
    <Link to={href} className={`settings-row-card settings-link-row${tone !== 'default' ? ` ${tone}` : ''}`} style={order ? { order } : undefined}>
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
  const navigate = useNavigate()
  const [settings, setSettings] = useState<TailorSettings>(() => loadTailorSettings())
  const [theme, setTheme] = useState<AppTheme>(() => getSavedTheme())
  const [panel, setPanel] = useState<SettingsPanel>(null)
  const [savedTick, setSavedTick] = useState(0)
  const [savedSection, setSavedSection] = useState('')
  const [securityFeedback, setSecurityFeedback] = useState('')
  const [invoicePreviewGenerated, setInvoicePreviewGenerated] = useState(false)
  const [generatedPreviewKind, setGeneratedPreviewKind] = useState<'invoice' | 'receipt'>('invoice')
  const [openBrandPreviewSheet, setOpenBrandPreviewSheet] = useState(false)
  const [openColorPicker, setOpenColorPicker] = useState<0 | 1 | null>(null)
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('Instagram')
  const [socialHandleInput, setSocialHandleInput] = useState('')
  const profilePhoneLocalPart = settings.profile.phone.replace(/^\+234/, '').replace(/\D/g, '')
  const businessPhoneLocalPart = settings.businessInfo.businessPhone.replace(/^\+234/, '').replace(/\D/g, '')
  const websiteLocalPart = settings.businessInfo.website.replace(/^https?:\/\//, '')

  useEffect(() => {
    function syncTheme() {
      setTheme(getSavedTheme())
    }

    window.addEventListener('storage', syncTheme)
    window.addEventListener('tailordeck-theme-updated', syncTheme)
    return () => {
      window.removeEventListener('storage', syncTheme)
      window.removeEventListener('tailordeck-theme-updated', syncTheme)
    }
  }, [])

  function handleSaveSettings(sectionLabel?: string) {
    const next = saveTailorSettings(settings)
    setSettings(next)
    setSavedTick(Date.now())
    if (sectionLabel) setSavedSection(sectionLabel)
  }

  function handleThemeToggle() {
    setTheme(toggleTheme())
  }

  function updateColor(index: 0 | 1, value: string) {
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

  function handleBusinessPhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, '')
    const normalizedLocal = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly
    setSettings((prev) => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, businessPhone: `+234${normalizedLocal}` },
    }))
  }

  function handleWebsiteChange(value: string) {
    const normalized = value.trim().replace(/^https?:\/\//, '')
    setSettings((prev) => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, website: `https://${normalized}` },
    }))
  }

  function clearJobHistory() {
    const confirmed = window.confirm('Clear all job history data? This action cannot be undone once backend is connected.')
    if (!confirmed) return
    window.localStorage.removeItem('tailordeck-job-history')
    window.localStorage.removeItem('tailordeck-jobs')
    window.alert('Job history cleared locally.')
  }

  function handleSignOut() {
    clearPreviewSession()
    navigate('/auth/signin')
  }

  function handleToggle(next: Exclude<SettingsPanel, null>) {
    setPanel((prev) => (prev === next ? null : next))
  }

  function handleSecurityAction(kind: 'password' | 'email' | 'phone') {
    if (kind === 'password') {
      setSecurityFeedback('Change password flow will be connected to Supabase Auth.')
      window.alert('Password update is a frontend placeholder for now. It will be wired to Supabase Auth.')
      return
    }

    if (kind === 'email') {
      setSecurityFeedback(`Login email placeholder set to: ${settings.profile.email}`)
      window.alert(`Email update placeholder saved.\nTarget email: ${settings.profile.email}`)
      return
    }

    setSecurityFeedback(`Login phone placeholder set to: ${settings.profile.phone}`)
    window.alert(`Phone update placeholder saved.\nTarget phone: ${settings.profile.phone}`)
  }

  function handleSecurityDanger(kind: 'deactivate' | 'delete') {
    if (kind === 'deactivate') {
      const ok = window.confirm('Deactivate account?\nYou can reactivate later once backend auth is connected.')
      if (!ok) return
      setSecurityFeedback('Account deactivation placeholder triggered.')
      window.alert('Account deactivation queued as placeholder. Supabase auth wiring will handle this fully.')
      return
    }

    const ok = window.confirm('Delete account permanently?\nThis is irreversible once backend auth is connected.')
    if (!ok) return
    setSecurityFeedback('Permanent delete placeholder triggered.')
    window.alert('Permanent account delete queued as placeholder. Supabase auth wiring will handle this fully.')
  }

  function addSocialHandle() {
    const handle = socialHandleInput.trim()
    if (!handle) return
    const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`

    const nextEntry = {
      id: `social-${socialPlatform.toLowerCase()}-${Date.now()}`,
      platform: socialPlatform,
      handle: normalizedHandle,
    }

    setSettings((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        socialHandles: [...prev.businessInfo.socialHandles, nextEntry],
      },
    }))
    setSocialHandleInput('')
  }

  function removeSocialHandle(id: string) {
    setSettings((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        socialHandles: prev.businessInfo.socialHandles.filter((item) => item.id !== id),
      },
    }))
  }

  function onBrandFileUpload(field: 'logoUrl' | 'signatureUrl', event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) return
      setSettings((prev) => ({ ...prev, brand: { ...prev.brand, [field]: result } }))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function onProfileAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) return
      setSettings((prev) => ({ ...prev, profile: { ...prev.profile, avatarUrl: result } }))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function toggleBrandDetail(key: keyof TailorSettings['brand']['includeBusinessDetails']) {
    setSettings((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        includeBusinessDetails: {
          ...prev.brand.includeBusinessDetails,
          [key]: !prev.brand.includeBusinessDetails[key],
        },
      },
    }))
  }

  function buildTemplatePreviewPayload(kind: 'invoice' | 'receipt'): DocumentTemplatePayload {
    const charge = 370000
    const deposit = kind === 'receipt' ? charge : 120000
    const balance = kind === 'receipt' ? 0 : charge - deposit

    return {
      kind,
      templateId: settings.brand.documentTemplate,
      documentId: `TD-${kind.toUpperCase()}-012345`,
      issuedDate: '24 May 2026',
      deadlineDate: '2026-05-28',
      clientName: 'John Smith',
      clientPhone: '08012345678',
      service: 'Custom Sewing Service',
      lineItems: [
        { description: 'Design Service', details: 'Sample row for preview', qty: 2, unitPrice: 75000, total: 150000 },
        { description: 'Fabric + Work', details: 'Sample row for preview', qty: 1, unitPrice: 130000, total: 130000 },
        { description: 'Finishing', details: 'Sample row for preview', qty: 1, unitPrice: 90000, total: 90000 },
      ],
      charge,
      deposit,
      balance,
      brand: {
        shopName: settings.businessInfo.shopName || settings.brand.name || 'TailorDeck',
        logoUrl: settings.brand.logoUrl,
        signatureUrl: settings.brand.signatureUrl,
        primaryColor: settings.brand.colors[0],
        secondaryColor: settings.brand.colors[1],
        accentColor: settings.brand.colors[0],
        shopAddress: settings.businessInfo.shopAddress,
        businessPhone: settings.businessInfo.businessPhone,
        businessEmail: settings.businessInfo.businessEmail,
        website: settings.businessInfo.website,
        socialHandles: settings.businessInfo.socialHandles,
        includeBusinessDetails: settings.brand.includeBusinessDetails,
      },
    }
  }

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <h1 className="settings-page-title">Settings</h1>
        <button
          type="button"
          className="btn btn-ghost btn-icon settings-theme-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={handleThemeToggle}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="settings-list">
        <SettingAccordion icon={<UserRound size={20} />} title="My Profile" order={1} panelKey="profile" panel={panel} onToggle={handleToggle}>
          <div className="stack gap-14 settings-profile-form">
            <div className="stack settings-profile-field">
              <label className="settings-profile-label">Profile Avatar</label>
              <label className="settings-profile-avatar-upload">
                <div className="settings-profile-avatar-preview">
                  <img src={settings.profile.avatarUrl || AVATAR_PLACEHOLDER} alt="Profile avatar preview" />
                </div>
                <span>Upload Profile Avatar</span>
                <input type="file" accept="image/*" className="settings-brand-upload-input" onChange={onProfileAvatarUpload} />
              </label>
            </div>
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
            <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={() => handleSaveSettings('My Profile')}>
              Save Profile
            </button>
            {savedSection === 'My Profile' && savedTick ? <p className="text-sm text-success">My Profile saved.</p> : null}
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<ShieldCheck size={20} />} title="Account & Security" tone="danger" order={6} panelKey="security" panel={panel} onToggle={handleToggle}>
          <div className="stack settings-security-form">
            <p className="settings-help-text">
              These controls are frontend placeholders for now. Supabase Auth wiring will handle real account updates.
            </p>

            <button type="button" className="settings-security-action" onClick={() => handleSecurityAction('password')}>
              <div className="row gap-8">
                <KeyRound size={15} className="settings-security-icon" />
                <span>Change Password</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <button type="button" className="settings-security-action" onClick={() => handleSecurityAction('email')}>
              <div className="row gap-8">
                <Mail size={15} className="settings-security-icon" />
                <span>Update Login Email</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <button type="button" className="settings-security-action" onClick={() => handleSecurityAction('phone')}>
              <div className="row gap-8">
                <Phone size={15} className="settings-security-icon" />
                <span>Update Login Phone</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <div className="stack settings-security-danger-wrap">
              <button type="button" className="settings-security-danger-btn" onClick={() => handleSecurityDanger('deactivate')}>
                <ShieldAlert size={15} />
                Deactivate Account
              </button>
              <button type="button" className="settings-security-danger-btn permanent" onClick={() => handleSecurityDanger('delete')}>
                <Trash2 size={15} />
                Delete Account Permanently
              </button>
            </div>

            {securityFeedback ? <p className="text-sm text-success">{securityFeedback}</p> : null}
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Store size={20} />} title="Shop Preferences" order={3} panelKey="preferences" panel={panel} onToggle={handleToggle}>
          <div className="stack settings-pref-form">
            <div className="stack settings-pref-group">
              <p className="settings-pref-label">Default Measurement Unit</p>
              <p className="settings-help-text">Used for measurement entry across jobs and client profiles.</p>
              <div className="settings-radio-list">
                {(['cm', 'inches'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    className={`settings-radio-option${settings.preferences.measurementUnit === unit ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, measurementUnit: unit } }))}
                  >
                    <span className="settings-radio-indicator" />
                    <span className="settings-radio-title">{unit === 'cm' ? 'Centimeters' : 'Inches'}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group settings-pref-group">
              <p className="settings-pref-label">Default Material Quality</p>
              <p className="settings-help-text">Default quality preselected when creating new jobs.</p>
              <div className="settings-radio-list">
                {(['Normal', 'Original', 'Fake', 'High Standard'] as MaterialQuality[]).map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    className={`settings-radio-option${settings.preferences.defaultMaterialQuality === quality ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, defaultMaterialQuality: quality } }))}
                  >
                    <span className="settings-radio-indicator" />
                    <span className="settings-radio-title">{quality}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={() => handleSaveSettings('Shop Preferences')}>
              Save Shop Preferences
            </button>
            {savedSection === 'Shop Preferences' && savedTick ? <p className="text-sm text-success">Shop Preferences saved.</p> : null}
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<BellRing size={20} />} title="Reminders & Notifications" order={5} panelKey="reminders" panel={panel} onToggle={handleToggle}>
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
              <p className="settings-help-text">How early we notify the tailor before delivery deadline.</p>
              <div className="settings-radio-list">
                {(['1 day before', '3 days before', '1 week before'] as ReminderLead[]).map((reminder) => (
                  <button
                    key={reminder}
                    type="button"
                    className={`settings-radio-option${settings.reminders.defaultReminder === reminder ? ' active' : ''}`}
                    onClick={() => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultReminder: reminder } }))}
                  >
                    <span className="settings-radio-indicator" />
                    <span className="settings-radio-title">{reminder}</span>
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
            <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={() => handleSaveSettings('Reminders')}>
              Save Reminders & Notifications
            </button>
            {savedSection === 'Reminders' && savedTick ? <p className="text-sm text-success">Reminders & Notifications saved.</p> : null}
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Building2 size={20} />} title="Business Info" order={2} panelKey="business" panel={panel} onToggle={handleToggle}>
          <div className="stack settings-business-form">
            <div className="input-group settings-business-group">
              <label className="settings-business-label row gap-6"><Building2 size={15} />Shop Name</label>
              <p className="settings-help-text">This is shown on documents and business header.</p>
              <input
                className="input settings-business-input"
                placeholder="Your shop name"
                value={settings.businessInfo.shopName}
                onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopName: value } })))}
              />
            </div>

            <div className="input-group settings-business-group">
              <label className="settings-business-label row gap-6"><Phone size={15} />Business Phone</label>
              <p className="settings-help-text">Used for client contact and invoice footer.</p>
              <div className="settings-phone-input-wrap">
                <span className="settings-phone-prefix">+234</span>
                <input
                  className="input settings-business-input settings-phone-input"
                  inputMode="numeric"
                  placeholder="8012345678"
                  value={businessPhoneLocalPart}
                  onChange={(event) => handleBusinessPhoneChange(event.target.value)}
                />
              </div>
            </div>

            <div className="input-group settings-business-group">
              <label className="settings-business-label row gap-6"><Mail size={15} />Business Email</label>
              <p className="settings-help-text">For receipts, invoices, and support contact.</p>
              <input className="input settings-business-input" value={settings.businessInfo.businessEmail} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessEmail: value } })))} />
            </div>

            <div className="input-group settings-business-group">
              <label className="settings-business-label row gap-6"><Globe size={15} />Business Website</label>
              <p className="settings-help-text">Optional website link shown on invoices.</p>
              <div className="settings-phone-input-wrap">
                <span className="settings-phone-prefix">https://</span>
                <input
                  className="input settings-business-input settings-phone-input settings-website-input"
                  placeholder="yourbusiness.com"
                  value={websiteLocalPart}
                  onChange={(event) => handleWebsiteChange(event.target.value)}
                />
              </div>
            </div>

            <div className="stack settings-business-group">
              <p className="settings-business-label row gap-6"><FaInstagram size={15} />Business Handle</p>
              <p className="settings-help-text">Add social handles used by your business.</p>

              <div className="settings-business-social-builder">
                <div className="settings-business-platform-row">
                  {socialPlatforms.map((platform) => {
                    const Icon = socialPlatformIcon[platform]
                    return (
                      <button
                        key={platform}
                        type="button"
                        className={`settings-choice-pill settings-business-platform-btn${socialPlatform === platform ? ' active' : ''}`}
                        onClick={() => setSocialPlatform(platform)}
                      >
                        <span className="settings-business-platform-pill-content">
                          <Icon size={14} style={{ color: socialPlatformColor[platform] }} />
                          <span>{platform}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="settings-business-handle-row">
                  <div className="settings-phone-input-wrap flex-1">
                    <span className="settings-phone-prefix">
                      <AtSign size={14} />
                    </span>
                    <input
                      className="input settings-business-input settings-phone-input"
                      placeholder="elonapparel"
                      value={socialHandleInput}
                      onChange={(event) => setSocialHandleInput(event.target.value.replace(/^@+/, ''))}
                    />
                  </div>
                  <button type="button" className="btn btn-primary settings-business-add-btn" onClick={addSocialHandle}>
                    <Plus size={15} />
                    Add
                  </button>
                </div>
              </div>

              <div className="settings-business-handle-list">
                {settings.businessInfo.socialHandles.map((item) => {
                  const Icon = socialPlatformIcon[item.platform]
                  return (
                    <div key={item.id} className="settings-business-handle-item">
                      <div className="row gap-8 min-w-0">
                        <Icon className="settings-business-handle-icon" size={14} />
                        <p className="settings-business-handle-text">{item.platform}: {item.handle}</p>
                      </div>
                      <button type="button" className="btn btn-ghost btn-icon settings-business-delete" onClick={() => removeSocialHandle(item.id)} aria-label={`Remove ${item.platform} handle`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="input-group settings-business-group">
              <label className="settings-business-label row gap-6"><Building2 size={15} />Shop Address</label>
              <p className="settings-help-text">Your physical shop location for delivery and pickup.</p>
              <textarea className="input settings-textarea settings-business-input" value={settings.businessInfo.shopAddress} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopAddress: value } })))} />
            </div>
            <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={() => handleSaveSettings('Business Info')}>
              Save Business Info
            </button>
            {savedSection === 'Business Info' && savedTick ? <p className="text-sm text-success">Business Info saved.</p> : null}
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Palette size={20} />} title="Invoice & Receipt Setup" order={4} panelKey="brand" panel={panel} onToggle={handleToggle}>
          <div className="stack settings-brand-form">
            <div className="stack settings-brand-group">
              <p className="settings-brand-label">Document Template</p>
              <p className="settings-help-text">
                One shared template is used for both invoice and receipt. Choose your header/body colors, upload logo and signature, then generate preview to review before saving.
              </p>
              <div className="settings-brand-template-grid">
                <div className="settings-brand-template-card active">
                  <div className="settings-brand-template-preview">
                    <div className="settings-brand-template-top" style={{ backgroundColor: settings.brand.colors[0] }} />
                    <div className="settings-brand-template-line" />
                    <div className="settings-brand-template-line short" />
                  </div>
                  <p className="settings-brand-template-title">{documentTemplate.title}</p>
                  <p className="settings-brand-template-sub">{documentTemplate.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="stack settings-brand-group">
              <p className="settings-brand-label">Select Your Brand Colors</p>
              <p className="settings-help-text">Choose a Header Color and Body Color. TailorDeck auto-mixes both for clean document sections.</p>
              <div className="settings-brand-color-pickers">
                {([
                  { label: 'Header', index: 0 as const },
                  { label: 'Body', index: 1 as const },
                ]).map((color) => (
                  <div key={color.label} className="settings-brand-color-picker-item">
                    <div className="row-between">
                      <p className="settings-brand-color-title">{color.label}</p>
                      <p className="settings-brand-color-hex">{settings.brand.colors[color.index].toUpperCase()}</p>
                    </div>
                    <button
                      type="button"
                      className="settings-choice-pill settings-brand-color-pick-btn"
                      onClick={() => setOpenColorPicker((prev) => (prev === color.index ? null : color.index))}
                    >
                      Pick {color.label} Color
                    </button>

                    {openColorPicker === color.index ? (
                      <div className="settings-brand-color-palette">
                        {brandColorOptions.map((hex) => (
                          <button
                            key={`${color.label}-${hex}`}
                            type="button"
                            className={`settings-brand-palette-chip${settings.brand.colors[color.index].toLowerCase() === hex.toLowerCase() ? ' active' : ''}`}
                            onClick={() => updateColor(color.index, hex)}
                          >
                            <span className="settings-brand-palette-dot" style={{ backgroundColor: hex }} />
                            <span>{hex.toUpperCase()}</span>
                          </button>
                        ))}
                        <label className="settings-brand-custom-color">
                          <span>Custom Color</span>
                          <input type="color" value={settings.brand.colors[color.index]} onChange={onInput((value) => updateColor(color.index, value))} />
                        </label>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="stack settings-brand-group">
              <p className="settings-brand-label">Business Logo</p>
              <p className="settings-help-text">Use PNG/JPG, max 2MB, square or horizontal logo works best.</p>
              <label className="settings-brand-upload-box">
                <div className="settings-brand-upload-preview">
                  {settings.brand.logoUrl ? <img src={settings.brand.logoUrl} alt="Logo preview" /> : <ImageIcon size={18} />}
                </div>
                <div className="stack gap-4">
                  <span>Upload Logo</span>
                </div>
                <input type="file" accept="image/*" className="settings-brand-upload-input" onChange={(event) => onBrandFileUpload('logoUrl', event)} />
              </label>
            </div>

            <div className="stack settings-brand-group">
              <p className="settings-brand-label">
                Business Signature <span className="settings-brand-signature-note">(image of your signature)</span>
              </p>
              <p className="settings-help-text">Use transparent PNG or clean JPG, max 2MB.</p>
              <label className="settings-brand-upload-box">
                <div className="settings-brand-upload-preview">
                  {settings.brand.signatureUrl ? <img src={settings.brand.signatureUrl} alt="Signature preview" /> : <Upload size={18} />}
                </div>
                <div className="stack gap-4">
                  <span>Upload Signature</span>
                </div>
                <input type="file" accept="image/*" className="settings-brand-upload-input" onChange={(event) => onBrandFileUpload('signatureUrl', event)} />
              </label>
            </div>

            <div className="stack settings-brand-group">
              <p className="settings-brand-label">Business Details To Show</p>
              <p className="settings-help-text">Choose which business information appears on invoice and receipt.</p>
              <div className="settings-radio-list">
                {([
                  { key: 'phone', label: 'Business Phone' },
                  { key: 'email', label: 'Business Email' },
                  { key: 'website', label: 'Business Website' },
                  { key: 'social', label: 'Social Handles' },
                  { key: 'address', label: 'Shop Address' },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`settings-radio-option${settings.brand.includeBusinessDetails[item.key] ? ' active' : ''}`}
                    onClick={() => toggleBrandDetail(item.key)}
                  >
                    <span className="settings-radio-indicator" />
                    <CheckSquare size={15} className="settings-radio-icon" />
                    <span className="settings-radio-title">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="stack settings-brand-group">
              <div className="settings-brand-final-preview">
                <button
                  type="button"
                  className="btn btn-primary settings-brand-generate-btn settings-brand-generate-btn-in-wrap"
                  onClick={() => {
                    setGeneratedPreviewKind('invoice')
                    setInvoicePreviewGenerated(true)
                    setOpenBrandPreviewSheet(true)
                  }}
                >
                  <FileText size={16} />
                  {invoicePreviewGenerated ? 'Open Preview' : 'Generate Preview'}
                </button>
              </div>
              {savedSection === 'Invoice & Receipt Setup' && savedTick ? <p className="text-sm text-success">Invoice & Receipt Setup saved.</p> : null}
            </div>
            <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={() => handleSaveSettings('Invoice & Receipt Setup')}>
              Save Invoice & Receipt Setup
            </button>
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<CircleHelp size={20} />} title="About TailorDeck" order={8} panelKey="about" panel={panel} onToggle={handleToggle}>
          <div className="settings-about-content">
            <p className="text-base font-semibold">Version 1.0.0</p>
            <p className="text-sm text-muted">Your shop, in your pocket.</p>
            <p className="text-sm text-muted">Built with ❤️ for tailors and fashion designers.</p>
          </div>
        </SettingAccordion>

        <SettingLinkRow
          icon={<WandSparkles size={20} />}
          title="Upgrade"
          subtitle={`Currently on ${settings.subscription.plan === 'free' ? 'Free' : settings.subscription.plan}`}
          href="/settings/subscription"
          tone="accent"
          order={7}
        />
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-secondary btn-full settings-clear-btn settings-clear-btn-shape" onClick={clearJobHistory}>
          <Database size={18} />
          Clear Job History
        </button>
        <button type="button" className="settings-signout-link" onClick={handleSignOut}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {openBrandPreviewSheet ? (
        <div
          className="side-sheet-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Invoice and receipt template preview"
          onClick={() => setOpenBrandPreviewSheet(false)}
        >
          <aside className="side-sheet" onClick={(event) => event.stopPropagation()}>
            <header className="side-sheet-header">
              <h3 className="side-sheet-title">Template Preview</h3>
              <button type="button" className="btn btn-ghost btn-icon side-sheet-close" onClick={() => setOpenBrandPreviewSheet(false)} aria-label="Close preview">
                <X size={18} />
              </button>
            </header>

            <div className="side-sheet-body">
              <div className="settings-brand-generated-paper">
                {renderTemplate(buildTemplatePreviewPayload(generatedPreviewKind))}
              </div>
              <div className="row gap-8 settings-brand-mode-switch">
                <button
                  type="button"
                  className={`btn btn-secondary flex-1${generatedPreviewKind === 'invoice' ? ' active' : ''}`}
                  onClick={() => setGeneratedPreviewKind('invoice')}
                >
                  View as Invoice
                </button>
                <button
                  type="button"
                  className={`btn btn-secondary flex-1${generatedPreviewKind === 'receipt' ? ' active' : ''}`}
                  onClick={() => setGeneratedPreviewKind('receipt')}
                >
                  View as Receipt
                </button>
              </div>
              <button
                type="button"
                className="btn btn-secondary settings-brand-edit-btn"
                onClick={() => {
                  setInvoicePreviewGenerated(false)
                  setOpenBrandPreviewSheet(false)
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-primary settings-brand-template-save-btn"
                onClick={() => {
                  handleSaveSettings('Invoice & Receipt Setup')
                  setOpenBrandPreviewSheet(false)
                }}
              >
                Save Template Design
              </button>
            </div>
          </aside>
        </div>
      ) : null}

    </section>
  )
}



