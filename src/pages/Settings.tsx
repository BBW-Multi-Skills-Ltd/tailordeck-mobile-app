import { BellRing, Building2, CircleHelp, Database, LogOut, Moon, Palette, ShieldCheck, Store, Sun, UserRound, WandSparkles } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AboutTailorDeckPanel from '../components/settings/AboutTailorDeckPanel'
import AccountSecurityPanel from '../components/settings/AccountSecurityPanel'
import BusinessInfoPanel from '../components/settings/BusinessInfoPanel'
import DocumentPreviewSheet from '../components/settings/DocumentPreviewSheet'
import InvoiceReceiptPanel from '../components/settings/InvoiceReceiptPanel'
import ProfileSettingsPanel from '../components/settings/ProfileSettingsPanel'
import RemindersPanel from '../components/settings/RemindersPanel'
import { SettingAccordion, SettingLinkRow, type SettingsPanel } from '../components/settings/SettingsRows'
import ShopPreferencesPanel from '../components/settings/ShopPreferencesPanel'
import { clearPreviewSession } from '../lib/auth'
import { getSavedTheme, toggleTheme, type AppTheme } from '../lib/theme'
import {
  loadTailorSettings,
  saveTailorSettings,
  type MaterialQuality,
  type NotificationBellOption,
  type ReminderLead,
  type RingtoneOption,
  type SocialPlatform,
  type TailorSettings,
} from '../lib/settings'

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
  const [passwordDraft, setPasswordDraft] = useState('')
  const [confirmPasswordDraft, setConfirmPasswordDraft] = useState('')

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

  function markSaved(sectionLabel: string, nextSettings: TailorSettings = settings): void {
    const next = saveTailorSettings(nextSettings)
    setSettings(next)
    setSavedTick(Date.now())
    setSavedSection(sectionLabel)
  }

  function handleThemeToggle(): void {
    setTheme(toggleTheme())
  }

  function handleToggle(next: Exclude<SettingsPanel, null>): void {
    setPanel((prev) => (prev === next ? null : next))
  }

  function openAccountSecurity(): void {
    setPanel('security')
    window.setTimeout(() => {
      document.querySelector('[data-settings-panel="security"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  function updateColor(index: 0 | 1, value: string): void {
    setSettings((prev) => {
      const colors: [string, string, string] = [...prev.brand.colors] as [string, string, string]
      colors[index] = value
      return { ...prev, brand: { ...prev.brand, colors } }
    })
  }

  function handleProfilePhoneChange(value: string): void {
    const digitsOnly = value.replace(/\D/g, '')
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, phone: `+234${digitsOnly}` } }))
  }

  function handleBusinessPhoneChange(value: string): void {
    const digitsOnly = value.replace(/\D/g, '')
    const normalizedLocal = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly
    setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessPhone: `+234${normalizedLocal}` } }))
  }

  function handleWebsiteChange(value: string): void {
    const normalized = value.trim().replace(/^https?:\/\//, '')
    setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, website: `https://${normalized}` } }))
  }

  function clearJobHistory(): void {
    const confirmed = window.confirm('Clear all job history data? This action cannot be undone once backend is connected.')
    if (!confirmed) return
    window.localStorage.removeItem('tailordeck-job-history')
    window.localStorage.removeItem('tailordeck-jobs')
    window.alert('Job history cleared locally.')
  }

  function handleSignOut(): void {
    clearPreviewSession()
    navigate('/auth/signin')
  }

  function handleSaveAccountSecurity(): void {
    markSaved('Account & Security')
    setSecurityFeedback('Account details saved locally. Supabase Auth will handle secure login updates later.')
  }

  function handleSecurityDanger(kind: 'deactivate' | 'delete'): void {
    if (kind === 'deactivate') {
      const ok = window.confirm('Deactivate account?\nYou can reactivate later once backend auth is connected.')
      if (!ok) return
      setSecurityFeedback('Account deactivation queued.')
      window.alert('Account deactivation queued as placeholder. Supabase auth wiring will handle this fully.')
      return
    }

    const ok = window.confirm('Delete account permanently?\nThis is irreversible once backend auth is connected.')
    if (!ok) return
    setSecurityFeedback('Permanent account delete queued.')
    window.alert('Permanent account delete queued as placeholder. Supabase auth wiring will handle this fully.')
  }

  function addSocialHandle(): void {
    const handle = socialHandleInput.trim()
    if (!handle) return
    const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`

    setSettings((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        socialHandles: [
          ...prev.businessInfo.socialHandles,
          {
            id: `social-${socialPlatform.toLowerCase()}-${Date.now()}`,
            platform: socialPlatform,
            handle: normalizedHandle,
          },
        ],
      },
    }))
    setSocialHandleInput('')
  }

  function removeSocialHandle(id: string): void {
    setSettings((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        socialHandles: prev.businessInfo.socialHandles.filter((item) => item.id !== id),
      },
    }))
  }

  function onBrandFileUpload(field: 'logoUrl' | 'signatureUrl', event: ChangeEvent<HTMLInputElement>): void {
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

  function onProfileAvatarUpload(event: ChangeEvent<HTMLInputElement>): void {
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

  function toggleBrandDetail(key: keyof TailorSettings['brand']['includeBusinessDetails']): void {
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

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <h1 className="settings-page-title">Settings</h1>
        <button type="button" className="btn btn-ghost btn-icon settings-theme-btn" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={handleThemeToggle}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="settings-list">
        <SettingAccordion icon={<UserRound size={20} />} title="My Profile" order={1} panelKey="profile" panel={panel} onToggle={handleToggle}>
          <ProfileSettingsPanel
            settings={settings}
            saved={savedSection === 'Profile Avatar' && Boolean(savedTick)}
            onAvatarUpload={onProfileAvatarUpload}
            onSavePhoto={() => markSaved('Profile Avatar')}
            onEditProfile={openAccountSecurity}
          />
        </SettingAccordion>

        <SettingAccordion icon={<Building2 size={20} />} title="Business Info" order={2} panelKey="business" panel={panel} onToggle={handleToggle}>
          <BusinessInfoPanel
            settings={settings}
            businessPhoneLocalPart={businessPhoneLocalPart}
            websiteLocalPart={websiteLocalPart}
            socialPlatform={socialPlatform}
            socialHandleInput={socialHandleInput}
            saved={savedSection === 'Business Info' && Boolean(savedTick)}
            onShopNameChange={(value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopName: value } }))}
            onBusinessPhoneChange={handleBusinessPhoneChange}
            onBusinessEmailChange={(value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessEmail: value } }))}
            onWebsiteChange={handleWebsiteChange}
            onSocialPlatformChange={setSocialPlatform}
            onSocialHandleInputChange={setSocialHandleInput}
            onAddSocialHandle={addSocialHandle}
            onRemoveSocialHandle={removeSocialHandle}
            onShopAddressChange={(value) => setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, shopAddress: value } }))}
            onSave={() => markSaved('Business Info')}
          />
        </SettingAccordion>

        <SettingAccordion icon={<Store size={20} />} title="Shop Preferences" order={3} panelKey="preferences" panel={panel} onToggle={handleToggle}>
          <ShopPreferencesPanel
            settings={settings}
            saved={savedSection === 'Shop Preferences' && Boolean(savedTick)}
            onMeasurementUnitChange={(measurementUnit) => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, measurementUnit } }))}
            onMaterialQualityChange={(defaultMaterialQuality: MaterialQuality) => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, defaultMaterialQuality } }))}
            onSave={() => markSaved('Shop Preferences')}
          />
        </SettingAccordion>

        <SettingAccordion icon={<Palette size={20} />} title="Invoice & Receipt Setup" order={4} panelKey="brand" panel={panel} onToggle={handleToggle}>
          <InvoiceReceiptPanel
            settings={settings}
            openColorPicker={openColorPicker}
            invoicePreviewGenerated={invoicePreviewGenerated}
            saved={savedSection === 'Invoice & Receipt Setup' && Boolean(savedTick)}
            onColorPickerToggle={(index) => setOpenColorPicker((prev) => (prev === index ? null : index))}
            onColorChange={updateColor}
            onFileUpload={onBrandFileUpload}
            onToggleBrandDetail={toggleBrandDetail}
            onGeneratePreview={() => {
              setGeneratedPreviewKind('invoice')
              setInvoicePreviewGenerated(true)
              setOpenBrandPreviewSheet(true)
            }}
            onSave={() => markSaved('Invoice & Receipt Setup')}
          />
        </SettingAccordion>

        <SettingAccordion icon={<BellRing size={20} />} title="Reminders & Notifications" order={5} panelKey="reminders" panel={panel} onToggle={handleToggle}>
          <RemindersPanel
            settings={settings}
            saved={savedSection === 'Reminders' && Boolean(savedTick)}
            onPushNotificationsChange={(pushNotifications) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, pushNotifications } }))}
            onNotificationBellEnabledChange={(notificationBellEnabled) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBellEnabled } }))}
            onNotificationBellChange={(notificationBell: NotificationBellOption) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, notificationBell } }))}
            onDefaultReminderChange={(defaultReminder: ReminderLead) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, defaultReminder } }))}
            onRingtoneEnabledChange={(ringtoneEnabled) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtoneEnabled } }))}
            onRingtoneChange={(ringtone: RingtoneOption) => setSettings((prev) => ({ ...prev, reminders: { ...prev.reminders, ringtone } }))}
            onSave={() => markSaved('Reminders')}
          />
        </SettingAccordion>

        <SettingAccordion icon={<ShieldCheck size={20} />} title="Account & Security" tone="danger" order={6} panelKey="security" panel={panel} onToggle={handleToggle}>
          <AccountSecurityPanel
            settings={settings}
            profilePhoneLocalPart={profilePhoneLocalPart}
            passwordDraft={passwordDraft}
            confirmPasswordDraft={confirmPasswordDraft}
            securityFeedback={securityFeedback}
            saved={savedSection === 'Account & Security' && Boolean(savedTick)}
            onFullNameChange={(fullName) => setSettings((prev) => ({ ...prev, profile: { ...prev.profile, fullName } }))}
            onEmailChange={(email) => setSettings((prev) => ({ ...prev, profile: { ...prev.profile, email } }))}
            onPhoneChange={handleProfilePhoneChange}
            onPasswordChange={setPasswordDraft}
            onConfirmPasswordChange={setConfirmPasswordDraft}
            onSave={handleSaveAccountSecurity}
            onDanger={handleSecurityDanger}
          />
        </SettingAccordion>

        <SettingLinkRow icon={<WandSparkles size={20} />} title="Upgrade" subtitle={`Currently on ${settings.subscription.plan === 'free' ? 'Free' : settings.subscription.plan}`} href="/settings/subscription" tone="accent" order={7} />

        <SettingAccordion icon={<CircleHelp size={20} />} title="About TailorDeck" order={8} panelKey="about" panel={panel} onToggle={handleToggle}>
          <AboutTailorDeckPanel />
        </SettingAccordion>
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
        <DocumentPreviewSheet
          settings={settings}
          previewKind={generatedPreviewKind}
          onPreviewKindChange={setGeneratedPreviewKind}
          onClose={() => setOpenBrandPreviewSheet(false)}
          onEdit={() => {
            setInvoicePreviewGenerated(false)
            setOpenBrandPreviewSheet(false)
          }}
          onSave={() => {
            markSaved('Invoice & Receipt Setup')
            setOpenBrandPreviewSheet(false)
          }}
        />
      ) : null}
    </section>
  )
}
