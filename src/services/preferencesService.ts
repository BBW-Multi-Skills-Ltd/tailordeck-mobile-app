import { supabase } from '../lib/supabase'
import type { UserPreferencesRow } from './types'
import { requireUserId } from './serviceHelpers'

export async function getPreferences(): Promise<UserPreferencesRow | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle<UserPreferencesRow>()
  if (error) throw error
  return data
}

export async function updatePreferences(updates: Partial<UserPreferencesRow>): Promise<UserPreferencesRow> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ ...updates, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('*')
    .single<UserPreferencesRow>()
  if (error) throw error
  return data
}
