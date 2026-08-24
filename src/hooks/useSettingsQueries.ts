import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettings, saveBrandSettings, saveBusinessSettings, savePreferenceSettings, saveProfileSettings, saveReminderSettings } from '../services/settingsService'
import { uploadLogo, uploadSignature } from '../services/brandService'
import { queryKeys } from './queryKeys'

const SETTINGS_STALE_TIME_MS = 1000 * 60 * 15
const SETTINGS_GC_TIME_MS = 1000 * 60 * 60

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: SETTINGS_STALE_TIME_MS,
    gcTime: SETTINGS_GC_TIME_MS,
  })
}

function useSettingsInvalidation() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
}

export function useSaveProfileSettingsMutation() {
  return useMutation({ mutationFn: saveProfileSettings })
}

export function useSaveBusinessSettingsMutation() {
  return useMutation({ mutationFn: saveBusinessSettings })
}

export function useSavePreferenceSettingsMutation() {
  return useMutation({ mutationFn: savePreferenceSettings })
}

export function useSaveReminderSettingsMutation() {
  return useMutation({ mutationFn: saveReminderSettings })
}

export function useSaveBrandSettingsMutation() {
  return useMutation({ mutationFn: saveBrandSettings })
}

export function useUploadLogoMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: uploadLogo, onSuccess: invalidate })
}

export function useUploadSignatureMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: uploadSignature, onSuccess: invalidate })
}
