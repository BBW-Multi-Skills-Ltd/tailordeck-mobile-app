import { useState } from 'react'
import type { SocialPlatform, TailorSettings } from '../../lib/settings'
import type { SettingsPanel } from './SettingsRows'

export function useSettingsDraftState(initialSettings: TailorSettings) {
  const [settings, setSettings] = useState<TailorSettings>(initialSettings)
  const [panel, setPanel] = useState<SettingsPanel>(null)
  const [savedTick, setSavedTick] = useState(0)
  const [savedSection, setSavedSection] = useState('')
  const [settingsError, setSettingsError] = useState('')
  const [securityFeedback, setSecurityFeedback] = useState('')
  const [invoicePreviewGenerated, setInvoicePreviewGenerated] = useState(false)
  const [generatedPreviewKind, setGeneratedPreviewKind] = useState<'invoice' | 'receipt'>('invoice')
  const [openBrandPreviewSheet, setOpenBrandPreviewSheet] = useState(false)
  const [openColorPicker, setOpenColorPicker] = useState<0 | 1 | null>(null)
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('Instagram')
  const [socialHandleInput, setSocialHandleInput] = useState('')
  const [passwordDraft, setPasswordDraft] = useState('')
  const [confirmPasswordDraft, setConfirmPasswordDraft] = useState('')
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)

  return {
    confirmPasswordDraft,
    generatedPreviewKind,
    invoicePreviewGenerated,
    openBrandPreviewSheet,
    openColorPicker,
    panel,
    passwordDraft,
    savedSection,
    savedTick,
    settingsError,
    securityFeedback,
    setConfirmPasswordDraft,
    setGeneratedPreviewKind,
    setInvoicePreviewGenerated,
    setOpenBrandPreviewSheet,
    setOpenColorPicker,
    setPanel,
    setPasswordDraft,
    setSavedSection,
    setSavedTick,
    setSettingsError,
    setSecurityFeedback,
    setSettings,
    setSignOutConfirmOpen,
    setSocialHandleInput,
    setSocialPlatform,
    settings,
    signOutConfirmOpen,
    socialHandleInput,
    socialPlatform,
  }
}
