import { supabase } from '../lib/supabase'
import type { DocumentRow } from './types'
import { fileExtension, requireUserId, uploadPrivateFile } from './serviceHelpers'

export type CreateDocumentInput = {
  documentNumber: string
  file: File
  jobId: string
  markSent?: boolean
  sentViaWhatsApp?: boolean
  type: 'invoice' | 'receipt'
}

export async function createDocument(input: CreateDocumentInput): Promise<DocumentRow> {
  const userId = await requireUserId()
  const storagePath = `${userId}/${input.jobId}/${input.type}-${input.documentNumber}.${fileExtension(input.file)}`
  const now = new Date().toISOString()

  await uploadPrivateFile({ bucket: 'documents', path: storagePath, file: input.file })

  const { data, error } = await supabase
    .from('documents')
    .upsert({
      user_id: userId,
      job_id: input.jobId,
      type: input.type,
      document_number: input.documentNumber,
      storage_path: storagePath,
      file_name: input.file.name,
      mime_type: input.file.type,
      size_bytes: input.file.size,
      sent_via_whatsapp: Boolean(input.sentViaWhatsApp),
      shared_at: input.markSent ? now : null,
      sent_at: input.markSent ? now : null,
    }, { onConflict: 'user_id,document_number' })
    .select('*')
    .single<DocumentRow>()

  if (error) throw error
  return data
}

export async function getDocuments(jobId: string, limit = 20): Promise<DocumentRow[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<DocumentRow[]>()

  if (error) throw error
  return data ?? []
}
