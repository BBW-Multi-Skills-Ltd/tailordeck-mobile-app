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

type FunctionInvokeError = {
  context?: {
    clone?: () => {
      json?: () => Promise<unknown>
      text?: () => Promise<string>
    }
    json?: () => Promise<unknown>
    text?: () => Promise<string>
  }
  message?: unknown
}

function isFunctionInvokeError(error: unknown): error is FunctionInvokeError {
  return typeof error === 'object' && error !== null && 'context' in error
}

function getErrorMessageFromBody(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const message = (body as { error?: unknown }).error
    if (typeof message === 'string' && message.trim()) return message
  }

  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }

  return ''
}

export async function getFunctionInvokeErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (!isFunctionInvokeError(error)) return getServiceErrorMessage(error, fallback)

  const context = error.context
  const readableContext = typeof context?.clone === 'function' ? context.clone() : context

  try {
    if (typeof readableContext?.json === 'function') {
      const message = getErrorMessageFromBody(await readableContext.json())
      if (message) return message
    }
  } catch {
    // Some Supabase errors expose a consumed response body. Fall back to text/message.
  }

  try {
    if (typeof readableContext?.text === 'function') {
      const text = await readableContext.text()
      if (text.trim()) return text
    }
  } catch {
    // Fall through to the generic error parser.
  }

  return getServiceErrorMessage(error, fallback)
}

export async function requireUserId(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession()
  const sessionUserId = sessionData.session?.user.id
  if (sessionUserId) return sessionUserId

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
  const cacheKey = `tailordeck:signed-url:${bucket}:${path}:${expiresIn}`
  const cached = getCachedSignedUrl(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  cacheSignedUrl(cacheKey, data.signedUrl, expiresIn)
  return data.signedUrl
}

export function userScopedPath(userId: string, fileName: string): string {
  return `${userId}/${fileName}`
}

function getCachedSignedUrl(cacheKey: string): string {
  if (typeof window === 'undefined') return ''

  try {
    const raw = window.sessionStorage.getItem(cacheKey)
    if (!raw) return ''
    const cached = JSON.parse(raw) as { expiresAt?: number; url?: string }
    if (!cached.url || !cached.expiresAt || cached.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(cacheKey)
      return ''
    }
    return cached.url
  } catch {
    return ''
  }
}

function cacheSignedUrl(cacheKey: string, url: string, expiresIn: number): void {
  if (typeof window === 'undefined') return

  try {
    const refreshMarginMs = 60_000
    const expiresAt = Date.now() + Math.max(0, expiresIn * 1000 - refreshMarginMs)
    window.sessionStorage.setItem(cacheKey, JSON.stringify({ expiresAt, url }))
  } catch {
    // Storage can fail in private browsing or quota-limited sessions; the app still works without this cache.
  }
}
