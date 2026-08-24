import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadTailorSettings,
  saveTailorSettings,
} from '../../lib/settings'
import { applyTheme } from '../../lib/theme'
import { useAuth } from '../../context/authContextCore'
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
  const lastAppliedSettingsQueryAtRef = useRef(0)
  const {
    confirmPasswordDraft, generatedPreviewKind, invoicePreviewGenerated, openBrandPreviewSheet, openColorPicker, panel,
    passwordDraft, savedSection, savedTick, securityFeedback, settingsError, setConfirmPasswordDraft, setGeneratedPreviewKind,
    setInvoicePreviewGenerated, setOpenBrandPreviewSheet, setOpenColorPicker, setPanel, setPasswordDraft,
    setSavedSection, setSavedTick, setSecurityFeedback, setSettings, setSettingsError, setSignOutConfirmOpen, setSocialHandleInput,
    setSocialPlatform, settings, signOutConfirmOpen, socialHandleInput, socialPlatform,
  } = draft
  const { uploadSettingsImage } = useSettingsImageUpload({ setSettings, setSettingsError })
  const { markSaved } = useSettingsSaveAction({
    saveBrandMutation,
    saveBusinessMutation,
    savePreferenceMutation,
    saveProfileMutation,
    saveReminderMutation,
    settings,
    setSettings,
    setSettingsError,
    setSavedSection,
    setSavedTick,
  })
  const formActions = useSettingsFormActions({ setSettings, setSocialHandleInput, socialHandleInput, socialPlatform })
  const accountActions = useSettingsAccountActions({
    confirmPasswordDraft,
    markSaved,
    navigate,
    passwordDraft,
    setSecurityFeedback,
    setSignOutConfirmOpen,
    settings,
    signOut,
  })
  const settingsSavePending =
    saveProfileMutation.isPending ||
    saveBusinessMutation.isPending ||
    savePreferenceMutation.isPending ||
    saveReminderMutation.isPending ||
    saveBrandMutation.isPending

  useEffect(() => {
    if (!settingsQuery.data) return
    if (settingsSavePending) return
    if (lastAppliedSettingsQueryAtRef.current === settingsQuery.dataUpdatedAt) return
    lastAppliedSettingsQueryAtRef.current = settingsQuery.dataUpdatedAt
    const next = saveTailorSettings(settingsQuery.data)
    setSettings(next)
    applyTheme(next.preferences.darkMode ? 'dark' : 'light')
  }, [settingsQuery.data, settingsQuery.dataUpdatedAt, settingsSavePending, setSettings])

  async function handleThemeToggle(): Promise<void> {
    const nextTheme = setTheme()
    const nextSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        darkMode: nextTheme === 'dark',
      },
    }
    await markSaved('Shop Preferences', nextSettings)
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
      setTheme: handleThemeToggle,
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
      settingsError,
      signOutConfirmOpen,
      settings,
      socialHandleInput,
      socialPlatform,
      theme,
    },
  }
}


