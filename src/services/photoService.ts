import { supabase } from '../lib/supabase'
import type { JobReferencePhotoRow } from './types'
import { createSignedUrl, fileExtension, requireUserId, uploadPrivateFile } from './serviceHelpers'

export async function uploadJobPhoto(jobId: string, file: File, sortOrder: number): Promise<JobReferencePhotoRow & { signedUrl: string }> {
  const userId = await requireUserId()
  const storagePath = `${userId}/${jobId}/photo-${sortOrder}.${fileExtension(file)}`
  await uploadPrivateFile({ bucket: 'job-photos', path: storagePath, file })
  const { data, error } = await supabase
    .from('job_reference_photos')
    .insert({ user_id: userId, job_id: jobId, storage_path: storagePath, file_name: file.name, mime_type: file.type, size_bytes: file.size, sort_order: sortOrder })
    .select('*')
    .single<JobReferencePhotoRow>()
  if (error) throw error
  const signedUrl = await createSignedUrl('job-photos', storagePath)
  return { ...data, signedUrl }
}

export async function getJobPhotoSignedUrls(jobId: string): Promise<string[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('job_reference_photos').select('*').eq('user_id', userId).eq('job_id', jobId).order('sort_order').returns<JobReferencePhotoRow[]>()
  if (error) throw error
  return Promise.all((data ?? []).map((photo) => createSignedUrl('job-photos', photo.storage_path)))
}
