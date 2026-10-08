import { supabase } from '../lib/supabase'
import type { JobPersonRow } from './types'
import { requireUserId } from './serviceHelpers'

export async function updateJobPerson(id: string, updates: Partial<JobPersonRow>): Promise<JobPersonRow> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('job_persons')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .single<JobPersonRow>()
  if (error) throw error
  return data
}
