import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { saveTailorSettings, type TailorSettings } from '../../lib/settings'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
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
  const savedTimerRef = useRef<number | null>(null)

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
    try {
      setSettingsError('')
      await persistSettingsSection(sectionLabel, nextSettings, {
        saveBrandMutation,
        saveBusinessMutation,
        savePreferenceMutation,
        saveProfileMutation,
        saveReminderMutation,
      })
      const next = saveTailorSettings(nextSettings)
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
