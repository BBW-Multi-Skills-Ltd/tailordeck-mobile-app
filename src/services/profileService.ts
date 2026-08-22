import { normalizeNigerianPhone } from '../lib/phone'
import { supabase } from '../lib/supabase'
import { compressImageFile } from '../lib/imageCompression'
import type { ProfileRow } from './types'
import { ServiceError, createSignedUrl, fileExtension, requireUserId, uploadPrivateFile, userScopedPath } from './serviceHelpers'
import { fileUploadSchema, parseSettingsUpdate, profileUpdateSchema } from '../validation/settingsSchemas'

const AVATAR_SIGNED_URL_TTL = 60 * 60 * 24 * 7
type AccountLifecycleEvent = 'account_deactivated' | 'account_deletion_requested' | 'account_restored'

export async function getProfile(): Promise<ProfileRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle<ProfileRow>()
  if (error) throw error
  if (!data?.avatar_storage_path) return data
  return { ...data, avatar_url: await createSignedUrl('avatars', data.avatar_storage_path, AVATAR_SIGNED_URL_TTL) }
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

export async function syncProfileEmailFromAuth(): Promise<ProfileRow | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  const authEmail = authData.user?.email?.trim().toLowerCase()
  const userId = authData.user?.id
  if (!authEmail || !userId) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>()
  if (profileError) throw profileError
  if (!profile || profile.email?.trim().toLowerCase() === authEmail) return profile

  const { data, error } = await supabase
    .from('profiles')
    .update({ email: authEmail, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('*')
    .maybeSingle<ProfileRow>()
  if (error) throw error
  return data
}

export async function activateVerifiedProfile(input: { fullName: string; email: string; phone: string }): Promise<ProfileRow> {
  const { data, error } = await supabase.rpc('activate_verified_profile', {
    full_name_value: input.fullName,
    email_value: input.email,
    phone_value: input.phone,
  }).single<ProfileRow>()
  if (error) throw error
  return data
}

export async function uploadAvatar(file: File): Promise<{ storagePath: string; signedUrl: string }> {
  fileUploadSchema.parse(file)
  const userId = await requireUserId()
  const uploadFile = await compressImageFile(file, { maxDimension: 520, maxBytes: 180_000, initialQuality: 0.82, minQuality: 0.58 })
  const storagePath = userScopedPath(userId, `avatar.${fileExtension(uploadFile)}`)
  await uploadPrivateFile({ bucket: 'avatars', path: storagePath, file: uploadFile })
  const signedUrl = await createSignedUrl('avatars', storagePath, AVATAR_SIGNED_URL_TTL)
  await updateProfile({ avatar_storage_path: storagePath, avatar_url: null })
  return { storagePath, signedUrl }
}

export async function deactivateAccount(reason?: string): Promise<ProfileRow> {
  const { data, error } = await supabase.rpc('deactivate_account', {
    reason_value: reason?.trim() || null,
  }).single<ProfileRow>()
  if (error) throw error
  await notifyAccountLifecycle('account_deactivated')
  return data
}

export async function requestAccountDeletion(reason?: string): Promise<ProfileRow> {
  const { data, error } = await supabase.rpc('request_account_deletion', {
    reason_value: reason?.trim() || null,
  }).single<ProfileRow>()
  if (error) throw error
  await notifyAccountLifecycle('account_deletion_requested')
  return data
}

export async function restoreAccount(): Promise<ProfileRow> {
  const { data, error } = await supabase.rpc('restore_account').single<ProfileRow>()
  if (error) throw error
  await notifyAccountLifecycle('account_restored')
  return data
}

async function notifyAccountLifecycle(eventType: AccountLifecycleEvent): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('account-lifecycle-notify', {
      body: { eventType },
    })
    if (error) throw error
  } catch (error) {
    console.warn('Account lifecycle email notification failed:', error)
  }
}
