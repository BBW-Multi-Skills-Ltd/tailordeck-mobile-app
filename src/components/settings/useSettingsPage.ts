import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearPreviewSession } from '../../lib/auth'
import {
  loadTailorSettings,
  saveTailorSettings,
  type SocialPlatform,
  type TailorSettings,
} from '../../lib/settings'
import type { SettingsPanel } from './SettingsRows'
import { getSettingsLocalParts, normalizeNigeriaPhoneInput, normalizeWebsiteInput } from './settingsFormUtils'
import { useSettingsTheme } from './useSettingsTheme'

export function useSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<TailorSettings>(() => loadTailorSettings())
  const { setTheme, theme } = useSettingsTheme()
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
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, phone: normalizeNigeriaPhoneInput(value) } }))
  }

  function handleBusinessPhoneChange(value: string): void {
    setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, businessPhone: normalizeNigeriaPhoneInput(value) } }))
  }

  function handleWebsiteChange(value: string): void {
    setSettings((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, website: normalizeWebsiteInput(value) } }))
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
      setTheme,
      toggleBrandDetail,
      updateColor,
      uploadSettingsImage,
      handleProfilePhoneChange,
    },
    derived: {
      ...getSettingsLocalParts(settings),
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
