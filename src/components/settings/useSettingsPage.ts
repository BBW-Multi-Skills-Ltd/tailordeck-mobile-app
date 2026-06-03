import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearPreviewSession } from '../../lib/auth'
import {
  loadTailorSettings,
  saveTailorSettings,
  type SocialPlatform,
  type TailorSettings,
} from '../../lib/settings'
import { getSavedTheme, toggleTheme } from '../../lib/theme'
import type { SettingsPanel } from './SettingsRows'

export function useSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<TailorSettings>(() => loadTailorSettings())
  const [theme, setTheme] = useState(() => getSavedTheme())
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
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, phone: `+234${value.replace(/\D/g, '')}` } }))
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
    if (!window.confirm('Clear all job history data? This action cannot be undone once backend is connected.')) return
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
    const message = kind === 'deactivate' ? 'Deactivate account?\nYou can reactivate later once backend auth is connected.' : 'Delete account permanently?\nThis is irreversible once backend auth is connected.'
    if (!window.confirm(message)) return

    setSecurityFeedback(kind === 'deactivate' ? 'Account deactivation queued.' : 'Permanent account delete queued.')
    window.alert(`${kind === 'deactivate' ? 'Account deactivation' : 'Permanent account delete'} queued as placeholder. Supabase auth wiring will handle this fully.`)
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
          { id: `social-${socialPlatform.toLowerCase()}-${Date.now()}`, platform: socialPlatform, handle: normalizedHandle },
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

  function uploadSettingsImage(field: 'avatarUrl' | 'logoUrl' | 'signatureUrl', event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) return
      setSettings((prev) =>
        field === 'avatarUrl'
          ? { ...prev, profile: { ...prev.profile, avatarUrl: result } }
          : { ...prev, brand: { ...prev.brand, [field]: result } },
      )
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

  return {
    actions: {
      addSocialHandle,
      clearJobHistory,
      handleBusinessPhoneChange,
      handleSaveAccountSecurity,
      handleSecurityDanger,
      handleSignOut,
      handleToggle,
      handleWebsiteChange,
      markSaved,
      openAccountSecurity,
      removeSocialHandle,
      setConfirmPasswordDraft,
      setGeneratedPreviewKind,
      setInvoicePreviewGenerated,
      setOpenBrandPreviewSheet,
      setOpenColorPicker,
      setPanel,
      setPasswordDraft,
      setSettings,
      setSocialHandleInput,
      setSocialPlatform,
      setTheme: () => setTheme(toggleTheme()),
      toggleBrandDetail,
      updateColor,
      uploadSettingsImage,
      handleProfilePhoneChange,
    },
    derived: {
      businessPhoneLocalPart: settings.businessInfo.businessPhone.replace(/^\+234/, '').replace(/\D/g, ''),
      profilePhoneLocalPart: settings.profile.phone.replace(/^\+234/, '').replace(/\D/g, ''),
      websiteLocalPart: settings.businessInfo.website.replace(/^https?:\/\//, ''),
    },
    state: {
      confirmPasswordDraft,
      generatedPreviewKind,
      invoicePreviewGenerated,
      openBrandPreviewSheet,
      openColorPicker,
      panel,
      passwordDraft,
      savedSection,
      savedTick,
      securityFeedback,
      settings,
      socialHandleInput,
      socialPlatform,
      theme,
    },
  }
}
