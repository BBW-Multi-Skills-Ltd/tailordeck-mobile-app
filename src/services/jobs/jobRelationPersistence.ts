import { uploadJobPhoto } from '../photoService'
import type { CreateFullJobInput } from './jobServiceTypes'

// Two at a time: on a weak connection, uploading every photo at once makes them all time out together.
const PHOTO_UPLOAD_CONCURRENCY = 2

export async function uploadJobReferencePhotos(input: CreateFullJobInput, jobId: string): Promise<void> {
  const queue = input.referencePhotos.map((photo, index) => ({ photo, index }))
  const failures: unknown[] = []

  async function worker(): Promise<void> {
    for (let next = queue.shift(); next; next = queue.shift()) {
      try {
        await uploadJobPhoto({
          file: next.photo.file,
          jobId,
          sortOrder: next.photo.sortOrder || next.index + 1,
          targetId: next.photo.targetId,
          targetLabel: next.photo.targetLabel,
        })
      } catch (error) {
        failures.push(error)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(PHOTO_UPLOAD_CONCURRENCY, queue.length) }, worker))
  if (failures.length) throw failures[0]
}
