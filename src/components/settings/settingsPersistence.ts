import type { TailorSettings } from '../../lib/settings'
import type {
  useSaveBrandSettingsMutation,
  useSaveBusinessSettingsMutation,
  useSavePreferenceSettingsMutation,
  useSaveProfileSettingsMutation,
  useSaveReminderSettingsMutation,
} from '../../hooks/useSettingsQueries'

type SaveMutation = ReturnType<
  | typeof useSaveBrandSettingsMutation
  | typeof useSaveBusinessSettingsMutation
  | typeof useSavePreferenceSettingsMutation
  | typeof useSaveProfileSettingsMutation
  | typeof useSaveReminderSettingsMutation
>

export type SettingsPersistenceMutations = {
  saveBrandMutation: SaveMutation
  saveBusinessMutation: SaveMutation
  savePreferenceMutation: SaveMutation
  saveProfileMutation: SaveMutation
  saveReminderMutation: SaveMutation
}

export async function persistSettingsSection(
  sectionLabel: string,
  nextSettings: TailorSettings,
  mutations: SettingsPersistenceMutations,
): Promise<void> {
  if (sectionLabel === 'Profile Avatar' || sectionLabel === 'Account & Security') {
    await mutations.saveProfileMutation.mutateAsync(nextSettings)
  } else if (sectionLabel === 'Business Info') {
    await mutations.saveBusinessMutation.mutateAsync(nextSettings)
  } else if (sectionLabel === 'Shop Preferences') {
    await mutations.savePreferenceMutation.mutateAsync(nextSettings)
  } else if (sectionLabel === 'Reminders') {
    await mutations.saveReminderMutation.mutateAsync(nextSettings)
  } else if (sectionLabel === 'Invoice & Receipt Setup') {
    await mutations.saveBrandMutation.mutateAsync(nextSettings)
  }
}
