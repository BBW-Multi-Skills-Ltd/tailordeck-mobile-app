import { supabase } from '../lib/supabase'
import type { DocumentRow } from './types'
import { fileExtension, requireUserId, uploadPrivateFile } from './serviceHelpers'

export async function createDocument(input: { jobId: string; type: 'invoice' | 'receipt'; file: File; documentNumber: string }): Promise<DocumentRow> {
  const userId = await requireUserId()
  const storagePath = `${userId}/${input.jobId}/${input.type}-${input.documentNumber}.${fileExtension(input.file)}`
  await uploadPrivateFile({ bucket: 'documents', path: storagePath, file: input.file })
  const { data, error } = await supabase
    .from('documents')
    .insert({ user_id: userId, job_id: input.jobId, type: input.type, document_number: input.documentNumber, storage_path: storagePath, file_name: input.file.name, mime_type: input.file.type, size_bytes: input.file.size })
    .select('*')
    .single<DocumentRow>()
  if (error) throw error
  return data
}

export async function getDocuments(jobId: string): Promise<DocumentRow[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('documents').select('*').eq('user_id', userId).eq('job_id', jobId).order('created_at', { ascending: false }).returns<DocumentRow[]>()
  if (error) throw error
  return data ?? []
}
