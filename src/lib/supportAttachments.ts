import { supabase } from './supabase'

// Support chat attachments: private Storage bucket, one folder per ticket (<ticket id>/<file>).
// Storage policies allow the ticket owner (while the ticket is open) and support admins.

export type SupportAttachment = { path: string; name: string; type: string; size: number }

const SUPPORT_ATTACHMENT_BUCKET = 'support-attachments'
const SUPPORT_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024
export const SUPPORT_ATTACHMENT_MAX_FILES = 5
export const SUPPORT_ATTACHMENT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,application/pdf'

const ALLOWED_TYPES = SUPPORT_ATTACHMENT_ACCEPT.split(',')

/** Returns an error message for a file that cannot be attached, or '' if it is fine. */
export function supportAttachmentProblem(file: File): string {
  if (!ALLOWED_TYPES.includes(file.type)) return `${file.name}: only photos and PDF files can be attached.`
  if (file.size > SUPPORT_ATTACHMENT_MAX_BYTES) return `${file.name} is larger than 5 MB.`
  return ''
}

function safeFileName(name: string): string {
  const cleaned = name.normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return (cleaned || 'file').slice(-80)
}

export async function uploadSupportAttachment(ticketId: string, file: File): Promise<SupportAttachment> {
  const problem = supportAttachmentProblem(file)
  if (problem) throw new Error(problem)
  const path = `${ticketId}/${crypto.randomUUID()}-${safeFileName(file.name)}`
  const { error } = await supabase.storage.from(SUPPORT_ATTACHMENT_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return { path, name: file.name.slice(0, 120), type: file.type, size: file.size }
}

/** Short-lived links for private attachments (keyed by path). */
export async function signSupportAttachments(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {}
  const { data, error } = await supabase.storage.from(SUPPORT_ATTACHMENT_BUCKET).createSignedUrls(paths, 60 * 60)
  if (error) throw error
  const links: Record<string, string> = {}
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) links[item.path] = item.signedUrl
  }
  return links
}

export function readSupportAttachments(value: unknown): SupportAttachment[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is SupportAttachment => Boolean(item) && typeof item === 'object' && typeof (item as SupportAttachment).path === 'string',
  )
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
