import { supabase } from '../lib/supabase'

export class ServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServiceError'
  }
}

export function getServiceErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new ServiceError('You must be signed in to perform this action.')
  return userId
}

export function fileExtension(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName) return fromName.toLowerCase()
  const fromType = file.type.split('/').pop()
  return fromType || 'bin'
}

export async function uploadPrivateFile(params: {
  bucket: 'avatars' | 'brand-assets' | 'job-photos' | 'documents'
  path: string
  file: File
}): Promise<string> {
  const { error } = await supabase.storage.from(params.bucket).upload(params.path, params.file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  return params.path
}

export async function createSignedUrl(bucket: string, path: string | null | undefined, expiresIn = 60 * 60): Promise<string> {
  if (!path) return ''
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export function userScopedPath(userId: string, fileName: string): string {
  return `${userId}/${fileName}`
}
