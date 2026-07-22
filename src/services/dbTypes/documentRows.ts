export interface DocumentRow {
  id: string
  user_id: string
  job_id: string
  type: 'invoice' | 'receipt'
  document_number: string
  storage_path: string | null
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
  sent_via_whatsapp: boolean
  shared_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}
