import { supabase } from '../lib/supabase'
import { brandSettingsUpdateSchema, fileUploadSchema, parseSettingsUpdate } from '../validation/settingsSchemas'
import type { BrandSettingsRow } from './types'
import { createSignedUrl, fileExtension, requireUserId, uploadPrivateFile } from './serviceHelpers'

export async function getBrandSettings(): Promise<BrandSettingsRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('brand_settings').select('*').eq('user_id', userId).maybeSingle<BrandSettingsRow>()
  if (error) throw error
  return data
}

export async function updateBrandSettings(updates: Partial<BrandSettingsRow>): Promise<BrandSettingsRow> {
  const userId = await requireUserId()
  const safeUpdates = parseSettingsUpdate(brandSettingsUpdateSchema, updates)
  const { data, error } = await supabase
    .from('brand_settings')
    .upsert({ ...safeUpdates, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('*')
    .single<BrandSettingsRow>()
  if (error) throw error
  return data
}

export async function uploadLogo(file: File): Promise<{ storagePath: string; signedUrl: string }> {
  fileUploadSchema.parse(file)
  const userId = await requireUserId()
  const storagePath = `${userId}/logo.${fileExtension(file)}`
  await uploadPrivateFile({ bucket: 'brand-assets', path: storagePath, file })
  const signedUrl = await createSignedUrl('brand-assets', storagePath)
  await updateBrandSettings({ logo_storage_path: storagePath, logo_url: signedUrl })
  return { storagePath, signedUrl }
}

export async function uploadSignature(file: File): Promise<{ storagePath: string; signedUrl: string }> {
  fileUploadSchema.parse(file)
  const userId = await requireUserId()
  const storagePath = `${userId}/signature.${fileExtension(file)}`
  await uploadPrivateFile({ bucket: 'brand-assets', path: storagePath, file })
  const signedUrl = await createSignedUrl('brand-assets', storagePath)
  await updateBrandSettings({ signature_storage_path: storagePath, signature_url: signedUrl })
  return { storagePath, signedUrl }
}
