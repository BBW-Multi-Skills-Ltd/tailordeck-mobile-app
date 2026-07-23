import { normalizeNigerianPhone } from '../lib/phone'
import { supabase } from '../lib/supabase'
import type { BusinessProfileRow, BusinessSocialHandleRow } from './types'
import { requireUserId } from './serviceHelpers'
import { businessProfileUpdateSchema, parseSettingsUpdate, socialHandleSchema } from '../validation/settingsSchemas'

export async function getBusinessProfile(): Promise<BusinessProfileRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('business_profiles').select('*').eq('user_id', userId).maybeSingle<BusinessProfileRow>()
  if (error) throw error
  return data
}

export async function updateBusinessProfile(updates: Partial<BusinessProfileRow>): Promise<BusinessProfileRow> {
  const userId = await requireUserId()
  const safeUpdates = parseSettingsUpdate(businessProfileUpdateSchema, updates)
  const next = {
    ...safeUpdates,
    user_id: userId,
    business_phone_normalized: safeUpdates.business_phone ? normalizeNigerianPhone(safeUpdates.business_phone) : undefined,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('business_profiles').upsert(next, { onConflict: 'user_id' }).select('*').single<BusinessProfileRow>()
  if (error) throw error
  return data
}

export async function getSocialHandles(): Promise<BusinessSocialHandleRow[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('business_social_handles').select('*').eq('user_id', userId).order('created_at').returns<BusinessSocialHandleRow[]>()
  if (error) throw error
  return data ?? []
}

export async function updateSocialHandles(handles: Array<Pick<BusinessSocialHandleRow, 'platform' | 'handle'>>): Promise<BusinessSocialHandleRow[]> {
  const userId = await requireUserId()
  const safeHandles = handles
    .map((handle) => socialHandleSchema.parse(handle))
    .filter((handle) => handle.handle.trim())
  const { error: deleteError } = await supabase.from('business_social_handles').delete().eq('user_id', userId)
  if (deleteError) throw deleteError
  if (safeHandles.length === 0) return []
  const rows = safeHandles.map((handle) => ({ ...handle, user_id: userId }))
  const { data, error } = await supabase.from('business_social_handles').insert(rows).select('*').returns<BusinessSocialHandleRow[]>()
  if (error) throw error
  return data ?? []
}
