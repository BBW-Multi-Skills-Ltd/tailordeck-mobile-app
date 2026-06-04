import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile, uploadAvatar } from '../services/profileService'
import { queryKeys } from './queryKeys'

export function useProfileQuery() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: getProfile })
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
