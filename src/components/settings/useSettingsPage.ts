import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadTailorSettings,
  saveTailorSettings,
} from '../../lib/settings'
import { useAuth } from '../../context/AuthContext'
import {
  useSaveBrandSettingsMutation,
  useSaveBusinessSettingsMutation,
  useSavePreferenceSettingsMutation,
  useSaveProfileSettingsMutation,
  useSaveReminderSettingsMutation,
  useSettingsQuery,
} from '../../hooks/useSettingsQueries'
import { useSettingsImageUpload } from './useSettingsImageUpload'
import type { SettingsPanel } from './SettingsRows'
import { useSettingsDraftState } from './useSettingsDraftState'
import { getSettingsLocalParts } from './settingsFormUtils'
import { useSettingsAccountActions } from './useSettingsAccountActions'
import { useSettingsFormActions } from './useSettingsFormActions'
import { useSettingsSaveAction } from './useSettingsSaveAction'
import { useSettingsTheme } from './useSettingsTheme'


export function useSettingsPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const settingsQuery = useSettingsQuery()
  const saveProfileMutation = useSaveProfileSettingsMutation()
  const saveBusinessMutation = useSaveBusinessSettingsMutation()
  const savePreferenceMutation = useSavePreferenceSettingsMutation()
  const saveReminderMutation = useSaveReminderSettingsMutation()
  const saveBrandMutation = useSaveBrandSettingsMutation()
  const { setTheme, theme } = useSettingsTheme()
  const draft = useSettingsDraftState(loadTailorSettings())
  const {
    confirmPasswordDraft, generatedPreviewKind, invoicePreviewGenerated, openBrandPreviewSheet, openColorPicker, panel,
    passwordDraft, savedSection, savedTick, securityFeedback, setConfirmPasswordDraft, setGeneratedPreviewKind,
    setInvoicePreviewGenerated, setOpenBrandPreviewSheet, setOpenColorPicker, setPanel, setPasswordDraft,
    setSavedSection, setSavedTick, setSecurityFeedback, setSettings, setSignOutConfirmOpen, setSocialHandleInput,
    setSocialPlatform, settings, signOutConfirmOpen, socialHandleInput, socialPlatform,
  } = draft
  const { uploadSettingsImage } = useSettingsImageUpload({ setSettings })
  const { markSaved } = useSettingsSaveAction({
    saveBrandMutation,
    saveBusinessMutation,
    savePreferenceMutation,
    saveProfileMutation,
    saveReminderMutation,
    settings,
    setSettings,
    setSavedSection,
    setSavedTick,
  })
  const formActions = useSettingsFormActions({ setSettings, setSocialHandleInput, socialHandleInput, socialPlatform })
  const accountActions = useSettingsAccountActions({
    markSaved,
    navigate,
    setSecurityFeedback,
    setSignOutConfirmOpen,
    signOut,
  })

  useEffect(() => {
    if (!settingsQuery.data) return
    const next = saveTailorSettings(settingsQuery.data)
    setSettings(next)
  }, [settingsQuery.data])

  function handleToggle(next: Exclude<SettingsPanel, null>): void {
    setPanel((prev) => (prev === next ? null : next))
  }

  function openAccountSecurity(): void {
    setPanel('security')
    window.setTimeout(() => {
      document.querySelector('[data-settings-panel="security"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return {
    actions: {
      ...accountActions,
      ...formActions,
      handleToggle,
      markSaved,
      openAccountSecurity,
      setConfirmPasswordDraft,
      setGeneratedPreviewKind,
      setInvoicePreviewGenerated,
      setOpenBrandPreviewSheet,
      setOpenColorPicker,
      setPanel,
      setPasswordDraft,
      setSettings,
      setSignOutConfirmOpen,
      setSocialHandleInput,
      setSocialPlatform,
      setTheme,
      uploadSettingsImage,
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
      signOutConfirmOpen,
      settings,
      socialHandleInput,
      socialPlatform,
      theme,
    },
  }
}


