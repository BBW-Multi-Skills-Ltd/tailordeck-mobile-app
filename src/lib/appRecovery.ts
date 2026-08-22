import { reportError } from './monitoring'

const CHUNK_RECOVERY_KEY = 'tailordeck:chunk-recovery-at'
const RECOVERY_COOLDOWN_MS = 30_000

function errorMessage(error: unknown): string {
  if (error instanceof Error) return `${error.name} ${error.message}`.toLowerCase()
  if (typeof error === 'string') return error.toLowerCase()
  if (error && typeof error === 'object' && 'message' in error) return String(error.message).toLowerCase()
  return ''
}

export function isRecoverableChunkError(error: unknown): boolean {
  const message = errorMessage(error)
  return [
    'failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'importing a module script failed',
    'chunkloaderror',
    'loading chunk',
    'unable to preload css',
  ].some((needle) => message.includes(needle))
}

async function clearAppCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.update().catch(() => undefined)))
  }
}

export async function recoverFromStaleAppShell(error: unknown): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const previousRecoveryAt = Number(window.sessionStorage.getItem(CHUNK_RECOVERY_KEY) || '0')
  const now = Date.now()
  if (now - previousRecoveryAt < RECOVERY_COOLDOWN_MS) return false

  window.sessionStorage.setItem(CHUNK_RECOVERY_KEY, String(now))
  reportError(error, { recovery: 'stale-app-shell-reload' })

  await clearAppCaches()
  window.location.reload()
  return true
}

export function installAppRecoveryHandlers(): void {
  if (typeof window === 'undefined') return

  window.addEventListener('unhandledrejection', (event) => {
    if (!isRecoverableChunkError(event.reason)) return
    event.preventDefault()
    void recoverFromStaleAppShell(event.reason)
  })

  window.addEventListener('error', (event) => {
    if (!isRecoverableChunkError(event.error ?? event.message)) return
    event.preventDefault()
    void recoverFromStaleAppShell(event.error ?? event.message)
  })
}
