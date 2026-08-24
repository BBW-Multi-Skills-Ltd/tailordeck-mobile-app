import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { saveTailorSettings, type TailorSettings } from '../../lib/settings'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { queryKeys } from '../../hooks/queryKeys'
import { persistSettingsSection, type SettingsPersistenceMutations } from './settingsPersistence'

const SAVED_FEEDBACK_MS = 2600

type UseSettingsSaveActionArgs = SettingsPersistenceMutations & {
  settings: TailorSettings
  setSettings: Dispatch<SetStateAction<TailorSettings>>
  setSavedSection: Dispatch<SetStateAction<string>>
  setSavedTick: Dispatch<SetStateAction<number>>
  setSettingsError: Dispatch<SetStateAction<string>>
}

export function useSettingsSaveAction({
  saveBrandMutation,
  saveBusinessMutation,
  savePreferenceMutation,
  saveProfileMutation,
  saveReminderMutation,
  settings,
  setSettings,
  setSavedSection,
  setSavedTick,
  setSettingsError,
}: UseSettingsSaveActionArgs) {
  const queryClient = useQueryClient()
  const savedTimerRef = useRef<number | null>(null)
  const currentSettingsRef = useRef(settings)

  useEffect(() => {
    currentSettingsRef.current = settings
  }, [settings])

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
    }
  }, [])

  function clearSavedFeedbackSoon(): void {
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)

    savedTimerRef.current = window.setTimeout(() => {
      setSavedSection('')
      setSavedTick(0)
      savedTimerRef.current = null
    }, SAVED_FEEDBACK_MS)
  }

  async function markSaved(sectionLabel: string, nextSettings: TailorSettings = settings): Promise<void> {
    const saveFingerprint = settingsFingerprint(nextSettings)
    currentSettingsRef.current = nextSettings
    try {
      setSettingsError('')
      await queryClient.cancelQueries({ queryKey: queryKeys.settings })
      await persistSettingsSection(sectionLabel, nextSettings, {
        saveBrandMutation,
        saveBusinessMutation,
        savePreferenceMutation,
        saveProfileMutation,
        saveReminderMutation,
      })
      if (settingsFingerprint(currentSettingsRef.current) !== saveFingerprint) return
      const next = saveTailorSettings(nextSettings)
      queryClient.setQueryData(queryKeys.settings, next)
      setSettings(next)
      setSavedTick(Date.now())
      setSavedSection(sectionLabel)
      clearSavedFeedbackSoon()
    } catch (error) {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
      setSavedSection('')
      setSavedTick(0)
      setSettingsError(getServiceErrorMessage(error, `Unable to save ${sectionLabel}.`))
    }
  }

  return { markSaved }
}

function settingsFingerprint(settings: TailorSettings): string {
  return JSON.stringify({ ...settings, updatedAt: '' })
}
