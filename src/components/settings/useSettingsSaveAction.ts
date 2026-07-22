import type { Dispatch, SetStateAction } from 'react'
import { saveTailorSettings, type TailorSettings } from '../../lib/settings'
import { getServiceErrorMessage } from '../../services/serviceHelpers'
import { persistSettingsSection, type SettingsPersistenceMutations } from './settingsPersistence'

type UseSettingsSaveActionArgs = SettingsPersistenceMutations & {
  settings: TailorSettings
  setSettings: Dispatch<SetStateAction<TailorSettings>>
  setSavedSection: Dispatch<SetStateAction<string>>
  setSavedTick: Dispatch<SetStateAction<number>>
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
}: UseSettingsSaveActionArgs) {
  async function markSaved(sectionLabel: string, nextSettings: TailorSettings = settings): Promise<void> {
    try {
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
    } catch (error) {
      window.alert(getServiceErrorMessage(error, `Unable to save ${sectionLabel}.`))
    }
  }

  return { markSaved }
}
