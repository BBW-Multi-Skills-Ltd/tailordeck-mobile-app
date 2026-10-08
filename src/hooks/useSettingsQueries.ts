import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/authContextCore'
import { fallbackSettings, readCachedSettings, writeCachedSettings } from '../lib/settingsCache'
import type { TailorSettings } from '../lib/settingsTypes'
import { getSettings, saveBrandSettings, saveBusinessSettings, savePreferenceSettings, saveProfileSettings, saveReminderSettings } from '../services/settingsService'
import { uploadLogo, uploadSignature } from '../services/brandService'
import { getProfile } from '../services/profileService'
import { getSubscription } from '../services/subscriptionService'
import { queryKeys } from './queryKeys'

const SETTINGS_STALE_TIME_MS = 1000 * 60 * 15
const SETTINGS_GC_TIME_MS = 1000 * 60 * 60

// Shared with the route guard: if it already loaded (or is loading) the profile or subscription,
// settings reuse that result instead of making the same requests again.
const SHARED_ROW_STALE_TIME_MS = 1000 * 60 * 5

/**
 * The signed-in user's settings from the server: the single source of truth for signed-in screens.
 * Shows the user's cached copy (from the last launch) until the server answers.
 */
export function useSettingsQuery() {
  const queryClient = useQueryClient()
  const userId = useAuth().user?.id
  const query = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () =>
      getSettings({
        profile: () => queryClient.fetchQuery({ queryKey: queryKeys.profile, queryFn: getProfile, staleTime: SHARED_ROW_STALE_TIME_MS }),
        subscription: () =>
          queryClient.fetchQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription, staleTime: SHARED_ROW_STALE_TIME_MS }),
      }),
    placeholderData: () => readCachedSettings(userId),
    staleTime: SETTINGS_STALE_TIME_MS,
    gcTime: SETTINGS_GC_TIME_MS,
    enabled: Boolean(userId),
  })

  useEffect(() => {
    if (query.data && !query.isPlaceholderData) writeCachedSettings(userId, query.data)
  }, [query.data, query.isPlaceholderData, userId])

  return query
}

/** Settings for signed-in screens: server data, the user's cached copy, or defaults while neither exists. */
export function useAppSettings(): TailorSettings {
  const data = useSettingsQuery().data
  const fallback = useMemo(() => fallbackSettings(), [])
  return data ?? fallback
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
