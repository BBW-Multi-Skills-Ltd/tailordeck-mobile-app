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
import { uploadSettingsImage as uploadSettingsImageFile } from './settingsImageUpload'
import { getSecurityDangerAlert, getSecurityDangerFeedback, getSecurityDangerMessage } from './settingsSecurityActions'
import { addSocialHandle as addSocialHandleToSettings, removeSocialHandle as removeSocialHandleFromSettings } from './settingsSocialActions'
import { useSettingsTheme } from './useSettingsTheme'

type SettingsImageField = 'avatarUrl' | 'logoUrl' | 'signatureUrl'

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
    if (!window.confirm(getSecurityDangerMessage(kind))) return

    setSecurityFeedback(getSecurityDangerFeedback(kind))
    window.alert(getSecurityDangerAlert(kind))
  }

  function addSocialHandle(): void {
    addSocialHandleToSettings({ setSettings, setSocialHandleInput, socialHandleInput, socialPlatform })
  }

  function removeSocialHandle(id: string): void {
    removeSocialHandleFromSettings(id, setSettings)
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
      uploadSettingsImage: (field: SettingsImageField, event: ChangeEvent<HTMLInputElement>) => uploadSettingsImageFile(field, event, setSettings),
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
