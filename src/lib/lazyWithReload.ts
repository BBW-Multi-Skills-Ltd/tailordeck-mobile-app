import { lazy, type ComponentType } from 'react'
import { isRecoverableChunkError, recoverFromStaleAppShell } from './appRecovery'

type LazyModule<TProps> = { default: ComponentType<TProps> }

export function lazyWithReload<TProps>(loader: () => Promise<LazyModule<TProps>>) {
  return lazy(async () => {
    try {
      return await loader()
    } catch (error) {
      if (isRecoverableChunkError(error) && (await recoverFromStaleAppShell(error))) {
        return new Promise<LazyModule<TProps>>(() => undefined)
      }

      throw error
    }
  })
}
