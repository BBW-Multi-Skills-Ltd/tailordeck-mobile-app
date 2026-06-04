import { normalizeNigerianPhone } from '../lib/phone'
import { supabase } from '../lib/supabase'
import type { ProfileRow } from './types'
import { createSignedUrl, fileExtension, requireUserId, uploadPrivateFile, userScopedPath } from './serviceHelpers'

export async function getProfile(): Promise<ProfileRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle<ProfileRow>()
  if (error) throw error
  return data
}

export async function updateProfile(updates: Partial<Pick<ProfileRow, 'full_name' | 'email' | 'phone' | 'avatar_url' | 'avatar_storage_path' | 'onboarding_complete'>>): Promise<ProfileRow> {
  const userId = await requireUserId()
  const next = {
    ...updates,
    phone_normalized: updates.phone ? normalizeNigerianPhone(updates.phone) : undefined,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('profiles').update(next).eq('id', userId).select('*').single<ProfileRow>()
  if (error) throw error
  return data
}

export async function uploadAvatar(file: File): Promise<{ storagePath: string; signedUrl: string }> {
  const userId = await requireUserId()
  const storagePath = userScopedPath(userId, `avatar.${fileExtension(file)}`)
  await uploadPrivateFile({ bucket: 'avatars', path: storagePath, file })
  const signedUrl = await createSignedUrl('avatars', storagePath)
  await updateProfile({ avatar_storage_path: storagePath, avatar_url: signedUrl })
  return { storagePath, signedUrl }
}
