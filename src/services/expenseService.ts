import { toKobo } from '../lib/money'
import { supabase } from '../lib/supabase'
import type { JobExpenseRow } from './types'
import { requireUserId } from './serviceHelpers'

export async function getJobExpenses(jobId: string): Promise<JobExpenseRow[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('job_expenses').select('*').eq('user_id', userId).eq('job_id', jobId).order('created_at').returns<JobExpenseRow[]>()
  if (error) throw error
  return data ?? []
}

export async function createExpense(jobId: string, input: { name: string; cost: number }): Promise<JobExpenseRow> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('job_expenses')
    .insert({ user_id: userId, job_id: jobId, name: input.name.trim(), cost_amount_kobo: toKobo(input.cost) })
    .select('*')
    .single<JobExpenseRow>()
  if (error) throw error
  return data
}

export async function deleteExpense(id: string): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('job_expenses').delete().eq('user_id', userId).eq('id', id)
  if (error) throw error
}
