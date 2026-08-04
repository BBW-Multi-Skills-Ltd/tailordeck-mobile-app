import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deactivateAccount, getProfile, requestAccountDeletion, restoreAccount, updateProfile, uploadAvatar } from '../services/profileService'
import { queryKeys } from './queryKeys'

export function useProfileQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.profile, queryFn: getProfile, enabled })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}

export function useDeactivateAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deactivateAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}

export function useRequestAccountDeletionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}

export function useRestoreAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: restoreAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}
