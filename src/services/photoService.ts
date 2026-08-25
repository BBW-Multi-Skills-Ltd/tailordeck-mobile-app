import { supabase } from '../lib/supabase'
import { compressImageFile } from '../lib/imageCompression'
import type { JobReferencePhotoRow } from './types'
import { createSignedUrl, fileExtension, requireUserId, uploadPrivateFile } from './serviceHelpers'

const JOB_PHOTO_SIGNED_URL_TTL = 60 * 60 * 24 * 7

export type UploadJobPhotoInput = {
  file: File
  jobId: string
  sortOrder: number
  targetId?: string | null
  targetLabel?: string | null
}

function safePathPart(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'job'
  )
}

export async function uploadJobPhoto(input: UploadJobPhotoInput): Promise<JobReferencePhotoRow> {
  const userId = await requireUserId()
  const compressedFile = await compressImageFile(input.file)
  const targetPart = safePathPart(input.targetId ?? 'job')
  const storagePath = `${userId}/${input.jobId}/${targetPart}-photo-${input.sortOrder}.${fileExtension(compressedFile)}`

  await uploadPrivateFile({ bucket: 'job-photos', file: compressedFile, path: storagePath })

  const { data, error } = await supabase
    .from('job_reference_photos')
    .insert({
      file_name: compressedFile.name,
      job_id: input.jobId,
      mime_type: compressedFile.type,
      size_bytes: compressedFile.size,
      sort_order: input.sortOrder,
      storage_path: storagePath,
      target_id: input.targetId ?? null,
      target_label: input.targetLabel ?? null,
      user_id: userId,
    })
    .select('*')
    .single<JobReferencePhotoRow>()

  if (error) throw error

  return { ...data, signed_url: await createSignedUrl('job-photos', storagePath, JOB_PHOTO_SIGNED_URL_TTL) }
}

export async function getJobPhotoSignedUrls(jobId: string): Promise<string[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('job_reference_photos')
    .select('*')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .order('sort_order')
    .returns<JobReferencePhotoRow[]>()

  if (error) throw error

  return Promise.all((data ?? []).map((photo) => createSignedUrl('job-photos', photo.storage_path, JOB_PHOTO_SIGNED_URL_TTL)))
}
