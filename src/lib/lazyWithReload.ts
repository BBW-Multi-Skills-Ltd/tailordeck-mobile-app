import { lazy, type ComponentType } from 'react'
import { reportError } from './monitoring'

const CHUNK_RELOAD_KEY = 'tailordeck:chunk-reload-at'
const RELOAD_COOLDOWN_MS = 60_000

type LazyModule<TProps> = { default: ComponentType<TProps> }

export function lazyWithReload<TProps>(loader: () => Promise<LazyModule<TProps>>) {
  return lazy(async () => {
    try {
      return await loader()
    } catch (error) {
      if (isChunkLoadError(error) && canReloadForFreshChunks()) {
        reportError(error, { reason: 'dynamic_import_chunk_reload' })
        window.location.reload()
        return new Promise<LazyModule<TProps>>(() => undefined)
      }

      throw error
    }
  })
}

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return [
    'Failed to fetch dynamically imported module',
    'Importing a module script failed',
    'Loading chunk',
    'ChunkLoadError',
  ].some((signature) => message.includes(signature))
}

function canReloadForFreshChunks(): boolean {
  if (typeof window === 'undefined') return false

  const lastReload = Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0)
  const now = Date.now()
  if (Number.isFinite(lastReload) && now - lastReload < RELOAD_COOLDOWN_MS) return false

  window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now))
  return true
}
