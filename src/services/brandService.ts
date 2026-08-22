import { supabase } from '../lib/supabase'
import { compressImageFile } from '../lib/imageCompression'
import { brandSettingsUpdateSchema, fileUploadSchema, parseSettingsUpdate } from '../validation/settingsSchemas'
import type { BrandSettingsRow } from './types'
import { createSignedUrl, fileExtension, requireUserId, uploadPrivateFile } from './serviceHelpers'

const BRAND_ASSET_SIGNED_URL_TTL = 60 * 60 * 24 * 7

export async function getBrandSettings(): Promise<BrandSettingsRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('brand_settings').select('*').eq('user_id', userId).maybeSingle<BrandSettingsRow>()
  if (error) throw error
  if (!data) return data
  const [logoUrl, signatureUrl] = await Promise.all([
    data.logo_storage_path ? createSignedUrl('brand-assets', data.logo_storage_path, BRAND_ASSET_SIGNED_URL_TTL) : Promise.resolve(data.logo_url),
    data.signature_storage_path ? createSignedUrl('brand-assets', data.signature_storage_path, BRAND_ASSET_SIGNED_URL_TTL) : Promise.resolve(data.signature_url),
  ])
  return { ...data, logo_url: logoUrl, signature_url: signatureUrl }
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
  const uploadFile = await compressImageFile(file, { maxDimension: 720, maxBytes: 260_000, initialQuality: 0.82, minQuality: 0.58 })
  const storagePath = `${userId}/logo.${fileExtension(uploadFile)}`
  await uploadPrivateFile({ bucket: 'brand-assets', path: storagePath, file: uploadFile })
  const signedUrl = await createSignedUrl('brand-assets', storagePath, BRAND_ASSET_SIGNED_URL_TTL)
  await updateBrandSettings({ logo_storage_path: storagePath, logo_url: null })
  return { storagePath, signedUrl }
}

export async function uploadSignature(file: File): Promise<{ storagePath: string; signedUrl: string }> {
  fileUploadSchema.parse(file)
  const userId = await requireUserId()
  const uploadFile = await compressImageFile(file, { maxDimension: 900, maxBytes: 280_000, initialQuality: 0.82, minQuality: 0.58 })
  const storagePath = `${userId}/signature.${fileExtension(uploadFile)}`
  await uploadPrivateFile({ bucket: 'brand-assets', path: storagePath, file: uploadFile })
  const signedUrl = await createSignedUrl('brand-assets', storagePath, BRAND_ASSET_SIGNED_URL_TTL)
  await updateBrandSettings({ signature_storage_path: storagePath, signature_url: null })
  return { storagePath, signedUrl }
}
