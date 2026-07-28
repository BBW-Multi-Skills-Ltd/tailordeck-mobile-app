import { normalizeNigerianPhone } from '../lib/phone'
import { supabase } from '../lib/supabase'
import type { ProfileRow } from './types'
import { ServiceError, createSignedUrl, fileExtension, requireUserId, uploadPrivateFile, userScopedPath } from './serviceHelpers'
import { fileUploadSchema, parseSettingsUpdate, profileUpdateSchema } from '../validation/settingsSchemas'

export async function getProfile(): Promise<ProfileRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle<ProfileRow>()
  if (error) throw error
  if (!data?.avatar_storage_path) return data
  return { ...data, avatar_url: await createSignedUrl('avatars', data.avatar_storage_path) }
}

export async function updateProfile(
  updates: Partial<Pick<ProfileRow, 'full_name' | 'email' | 'phone' | 'avatar_url' | 'avatar_storage_path' | 'onboarding_complete' | 'account_status' | 'deleted_at'>>,
): Promise<ProfileRow> {
  const userId = await requireUserId()
  const safeUpdates = parseSettingsUpdate(profileUpdateSchema, updates)
  const next = {
    ...safeUpdates,
    phone_normalized: safeUpdates.phone ? normalizeNigerianPhone(safeUpdates.phone) : undefined,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('profiles').update(next).eq('user_id', userId).select('*').maybeSingle<ProfileRow>()
  if (error) throw error
  if (!data) throw new ServiceError('Profile update was blocked or no profile row exists for this user.')
  return data
}

export async function uploadAvatar(file: File): Promise<{ storagePath: string; signedUrl: string }> {
  fileUploadSchema.parse(file)
  const userId = await requireUserId()
  const storagePath = userScopedPath(userId, `avatar.${fileExtension(file)}`)
  await uploadPrivateFile({ bucket: 'avatars', path: storagePath, file })
  const signedUrl = await createSignedUrl('avatars', storagePath)
  await updateProfile({ avatar_storage_path: storagePath, avatar_url: null })
  return { storagePath, signedUrl }
}
