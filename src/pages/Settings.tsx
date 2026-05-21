import {
  BellRing,
  Building2,
  CheckSquare,
  ChevronRight,
  CircleHelp,
  Database,
  FileText,
  Globe,
  Image as ImageIcon,
  LogOut,
  Mail,
  Moon,
  Palette,
  Phone,
  Plus,
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
import { useState, type ChangeEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  loadTailorSettings,
  saveTailorSettings,
  type MaterialQuality,
  type NotificationBellOption,
  type InvoiceTemplateOption,
  type ReceiptTemplateOption,
  type ReminderLead,
  type RingtoneOption,
  type SocialPlatform,
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

const invoiceTemplateOptions: Array<{ value: InvoiceTemplateOption; title: string; subtitle: string }> = [
  { value: 'classic-curve', title: 'Template 1', subtitle: 'Classic Curve' },
  { value: 'left-panel', title: 'Template 2', subtitle: 'Left Panel' },
  { value: 'top-card', title: 'Template 3', subtitle: 'Top Card' },
]

const receiptTemplateOptions: Array<{ value: ReceiptTemplateOption; title: string; subtitle: string }> = [
  { value: 'clean-slip', title: 'Template 1', subtitle: 'Clean Slip' },
  { value: 'compact-block', title: 'Template 2', subtitle: 'Compact Block' },
  { value: 'minimal-ledger', title: 'Template 3', subtitle: 'Minimal Ledger' },
]

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
  const [invoicePreviewGenerated, setInvoicePreviewGenerated] = useState(false)
  const [openColorPicker, setOpenColorPicker] = useState<0 | 1 | 2 | null>(null)
  const [templatePreview, setTemplatePreview] = useState<{ kind: 'invoice' | 'receipt'; value: string; title: string } | null>(null)
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('Instagram')
  const [socialHandleInput, setSocialHandleInput] = useState('')
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

  function addSocialHandle() {
    const handle = socialHandleInput.trim()
    if (!handle) return

    const nextEntry = {
      id: `social-${socialPlatform.toLowerCase()}-${Date.now()}`,
      platform: socialPlatform,
      handle,
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

  function applyTemplateSelection() {
    if (!templatePreview) return
    if (templatePreview.kind === 'invoice') {
      setSettings((prev) => ({ ...prev, brand: { ...prev.brand, invoiceTemplate: templatePreview.value as InvoiceTemplateOption } }))
    } else {
      setSettings((prev) => ({ ...prev, brand: { ...prev.brand, receiptTemplate: templatePreview.value as ReceiptTemplateOption } }))
    }
    setTemplatePreview(null)
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
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Building2 size={20} />} title="Business Info" panelKey="business" panel={panel} onToggle={handleToggle}>
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
              <input className="input settings-business-input" value={settings.businessInfo.businessPhone} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessPhone: value } })))} />
            </div>

            <div className="input-group settings-business-group">
              <label className="settings-business-label row gap-6"><Mail size={15} />Business Email</label>
              <p className="settings-help-text">For receipts, invoices, and support contact.</p>
              <input className="input settings-business-input" value={settings.businessInfo.businessEmail} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessEmail: value } })))} />
            </div>

            <div className="input-group settings-business-group">
              <label className="settings-business-label row gap-6"><Globe size={15} />Business Website</label>
              <p className="settings-help-text">Optional website link shown on invoices.</p>
              <input className="input settings-business-input" placeholder="https://yourbusiness.com" value={settings.businessInfo.website} onChange={onInput((value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, website: value } })))} />
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
                  <input
                    className="input settings-business-input flex-1"
                    placeholder="e.g. @elonapparel"
                    value={socialHandleInput}
                    onChange={(event) => setSocialHandleInput(event.target.value)}
                  />
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
          </div>
        </SettingAccordion>

        <SettingAccordion icon={<Palette size={20} />} title="Invoice & Receipt Setup" panelKey="brand" panel={panel} onToggle={handleToggle}>
          <div className="stack settings-brand-form">
            <div className="stack settings-brand-group">
              <p className="settings-brand-label">Invoice Template</p>
              <p className="settings-help-text">Pick one invoice style TailorDeck should use.</p>
              <div className="settings-brand-template-grid">
                {invoiceTemplateOptions.map((template) => (
                  <button
                    key={template.value}
                    type="button"
                    className={`settings-brand-template-card${settings.brand.invoiceTemplate === template.value ? ' active' : ''}`}
                    onClick={() => setTemplatePreview({ kind: 'invoice', value: template.value, title: template.subtitle })}
                  >
                    <div className="settings-brand-template-preview">
                      <div className="settings-brand-template-top" style={{ backgroundColor: settings.brand.colors[0] }} />
                      <div className="settings-brand-template-line" />
                      <div className="settings-brand-template-line short" />
                    </div>
                    <p className="settings-brand-template-title">{template.title}</p>
                    <p className="settings-brand-template-sub">{template.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="stack settings-brand-group">
              <p className="settings-brand-label">Receipt Template</p>
              <p className="settings-help-text">Pick one receipt style TailorDeck should use.</p>
              <div className="settings-brand-template-grid">
                {receiptTemplateOptions.map((template) => (
                  <button
                    key={template.value}
                    type="button"
                    className={`settings-brand-template-card${settings.brand.receiptTemplate === template.value ? ' active' : ''}`}
                    onClick={() => setTemplatePreview({ kind: 'receipt', value: template.value, title: template.subtitle })}
                  >
                    <div className="settings-brand-template-preview">
                      <div className="settings-brand-template-top" style={{ backgroundColor: settings.brand.colors[2] }} />
                      <div className="settings-brand-template-line" />
                      <div className="settings-brand-template-line short" />
                    </div>
                    <p className="settings-brand-template-title">{template.title}</p>
                    <p className="settings-brand-template-sub">{template.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="stack settings-brand-group">
              <p className="settings-brand-label">Select Your Brand Colors</p>
              <p className="settings-help-text">These colors style invoices and receipts. Maximum: 3 colors.</p>
              <div className="settings-brand-color-pickers">
                {([
                  { label: 'Primary', index: 0 as const },
                  { label: 'Secondary', index: 1 as const },
                  { label: 'Accent', index: 2 as const },
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
              {!invoicePreviewGenerated ? (
                <button type="button" className="btn btn-primary settings-brand-generate-btn" onClick={() => setInvoicePreviewGenerated(true)}>
                  <FileText size={16} />
                  Generate Preview
                </button>
              ) : (
                <div className="settings-brand-final-preview">
                  <div className="settings-brand-final-header" style={{ background: settings.brand.colors[0] }}>
                    {settings.brand.logoUrl ? <img src={settings.brand.logoUrl} alt="Brand logo" className="settings-brand-final-logo" /> : null}
                    <p className="settings-brand-final-title">{settings.businessInfo.shopName}</p>
                  </div>
                  <div className="stack gap-6 settings-brand-final-body">
                    <p className="text-sm font-semibold">Invoice: {invoiceTemplateOptions.find((x) => x.value === settings.brand.invoiceTemplate)?.subtitle}</p>
                    <p className="text-sm font-semibold">Receipt: {receiptTemplateOptions.find((x) => x.value === settings.brand.receiptTemplate)?.subtitle}</p>
                    {settings.brand.includeBusinessDetails.phone ? <p className="text-sm text-muted">{settings.businessInfo.businessPhone}</p> : null}
                    {settings.brand.includeBusinessDetails.email ? <p className="text-sm text-muted">{settings.businessInfo.businessEmail}</p> : null}
                    {settings.brand.includeBusinessDetails.website ? <p className="text-sm text-muted">{settings.businessInfo.website}</p> : null}
                    {settings.brand.includeBusinessDetails.social && settings.businessInfo.socialHandles.length ? (
                      <p className="text-sm text-muted">{settings.businessInfo.socialHandles.map((x) => `${x.platform} ${x.handle}`).join(' • ')}</p>
                    ) : null}
                    {settings.brand.includeBusinessDetails.address ? <p className="text-sm text-muted">{settings.businessInfo.shopAddress}</p> : null}
                  </div>
                  <button type="button" className="btn btn-secondary settings-brand-edit-btn" onClick={() => setInvoicePreviewGenerated(false)}>
                    Edit
                  </button>
                </div>
              )}
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

      {templatePreview ? (
        <div className="sheet-overlay settings-template-preview-overlay" role="dialog" aria-modal="true" aria-label="Template preview">
          <div className="settings-template-preview-stage">
            <button type="button" className="btn btn-ghost btn-icon settings-template-preview-close" onClick={() => setTemplatePreview(null)} aria-label="Close preview">
              <X size={20} />
            </button>

            <div className="settings-template-preview-paper">
              <div className="settings-template-preview-head" style={{ background: settings.brand.colors[0] }} />
              <div className="settings-template-preview-band" style={{ background: settings.brand.colors[2] }} />
              <div className="settings-template-preview-body">
                <div className="settings-template-preview-line" />
                <div className="settings-template-preview-line short" />
                <div className="settings-template-preview-table">
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
                <div className="settings-template-preview-line" />
                <div className="settings-template-preview-line short" />
              </div>
            </div>

            <div className="settings-template-preview-footer">
              <p className="settings-template-preview-title">{templatePreview.kind === 'invoice' ? 'Invoice Template' : 'Receipt Template'}: {templatePreview.title}</p>
              <button type="button" className="btn btn-primary settings-template-preview-use" onClick={applyTemplateSelection}>
                Use This Template
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
