import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettings, saveBrandSettings, saveBusinessSettings, savePreferenceSettings, saveProfileSettings, saveReminderSettings } from '../services/settingsService'
import { uploadLogo, uploadSignature } from '../services/brandService'
import { queryKeys } from './queryKeys'

export function useSettingsQuery() {
  return useQuery({ queryKey: queryKeys.settings, queryFn: getSettings })
}

function useSettingsInvalidation() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
}

export function useSaveProfileSettingsMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: saveProfileSettings, onSuccess: invalidate })
}

export function useSaveBusinessSettingsMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: saveBusinessSettings, onSuccess: invalidate })
}

export function useSavePreferenceSettingsMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: savePreferenceSettings, onSuccess: invalidate })
}

export function useSaveReminderSettingsMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: saveReminderSettings, onSuccess: invalidate })
}

export function useSaveBrandSettingsMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: saveBrandSettings, onSuccess: invalidate })
}

export function useUploadLogoMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: uploadLogo, onSuccess: invalidate })
}

export function useUploadSignatureMutation() {
  const invalidate = useSettingsInvalidation()
  return useMutation({ mutationFn: uploadSignature, onSuccess: invalidate })
}
