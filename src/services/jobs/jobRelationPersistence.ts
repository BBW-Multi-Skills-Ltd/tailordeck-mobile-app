import { supabase } from '../../lib/supabase'
import { uploadJobPhoto } from '../photoService'
import { buildJobExpenseRows, buildJobPersonRows } from './jobRelationRows'
import type { CreateFullJobInput } from './jobServiceTypes'

export async function insertJobRelations(input: CreateFullJobInput, userId: string, jobId: string, clientId: string | null): Promise<void> {
  const personRows = buildJobPersonRows(input, userId, jobId, clientId)
  if (personRows.length) {
    const { error } = await supabase.from('job_persons').insert(personRows)
    if (error) throw error
  }

  const expenseRows = buildJobExpenseRows(input, userId, jobId)
  if (expenseRows.length) {
    const { error } = await supabase.from('job_expenses').insert(expenseRows)
    if (error) throw error
  }
}

export async function replaceJobRelations(input: CreateFullJobInput, userId: string, jobId: string, clientId: string | null): Promise<void> {
  const [personsDelete, expensesDelete] = await Promise.all([
    supabase.from('job_persons').delete().eq('user_id', userId).eq('job_id', jobId),
    supabase.from('job_expenses').delete().eq('user_id', userId).eq('job_id', jobId),
  ])

  if (personsDelete.error) throw personsDelete.error
  if (expensesDelete.error) throw expensesDelete.error

  await insertJobRelations(input, userId, jobId, clientId)
}

export async function uploadJobReferencePhotos(input: CreateFullJobInput, jobId: string, existingPhotoCount = 0): Promise<void> {
  await Promise.all(
    input.referencePhotos.map((photo, index) =>
      uploadJobPhoto({
        file: photo.file,
        jobId,
        sortOrder: existingPhotoCount + (photo.sortOrder || index + 1),
        targetId: photo.targetId,
        targetLabel: photo.targetLabel,
      }),
    ),
  )
}

export async function touchClientLastJobDate(userId: string, clientId: string | null, status?: string): Promise<void> {
  if (!clientId || status === 'Draft') return

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('clients')
    .update({ last_job_date: now.slice(0, 10), updated_at: now })
    .eq('user_id', userId)
    .eq('id', clientId)

  if (error) throw error
}
