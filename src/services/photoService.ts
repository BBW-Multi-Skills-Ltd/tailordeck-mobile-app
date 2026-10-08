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

/**
 * Same file -> same key, so uploading a photo again (retry after a failed save, or draft then finalize)
 * overwrites it instead of creating a duplicate.
 */
function photoKey(file: File): string {
  const source = `${file.name}|${file.size}|${file.lastModified}`
  let hash = 0
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0
  }
  return hash.toString(36)
}

export async function uploadJobPhoto(input: UploadJobPhotoInput): Promise<JobReferencePhotoRow> {
  const userId = await requireUserId()
  const compressedFile = await compressImageFile(input.file)
  const targetPart = safePathPart(input.targetId ?? 'job')
  const storagePath = `${userId}/${input.jobId}/${targetPart}-photo-${photoKey(input.file)}.${fileExtension(compressedFile)}`

  await uploadPrivateFile({ bucket: 'job-photos', file: compressedFile, path: storagePath })

  const { data, error } = await supabase
    .from('job_reference_photos')
    .upsert({
      file_name: compressedFile.name,
      job_id: input.jobId,
      mime_type: compressedFile.type,
      size_bytes: compressedFile.size,
      sort_order: input.sortOrder,
      storage_path: storagePath,
      target_id: input.targetId ?? null,
      target_label: input.targetLabel ?? null,
      user_id: userId,
    }, { onConflict: 'job_id,storage_path' })
    .select('*')
    .single<JobReferencePhotoRow>()

  if (error) throw error

  return { ...data, signed_url: await createSignedUrl('job-photos', storagePath, JOB_PHOTO_SIGNED_URL_TTL) }
}
