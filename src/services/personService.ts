import { supabase } from '../lib/supabase'
import type { JobPersonRow } from './types'
import { requireUserId } from './serviceHelpers'

export async function getJobPersons(jobId: string): Promise<JobPersonRow[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('job_persons').select('*').eq('user_id', userId).eq('job_id', jobId).order('sort_order').returns<JobPersonRow[]>()
  if (error) throw error
  return data ?? []
}

export async function createJobPerson(input: Omit<JobPersonRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<JobPersonRow> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('job_persons').insert({ ...input, user_id: userId }).select('*').single<JobPersonRow>()
  if (error) throw error
  return data
}

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
