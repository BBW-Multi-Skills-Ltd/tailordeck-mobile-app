import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AppFeedbackContext, type ConfirmOptions, type ToastTone } from './appFeedbackCore'

type ToastState = {
  id: number
  message: string
  tone: ToastTone
} | null

type ConfirmState = {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  tone: 'default' | 'danger'
  resolve: (confirmed: boolean) => void
} | null

const TOAST_TIMEOUT_MS = 2600

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [toastState, setToastState] = useState<ToastState>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now()
    setToastState({ id, message, tone })
    window.setTimeout(() => {
      setToastState((current) => (current?.id === id ? null : current))
    }, TOAST_TIMEOUT_MS)
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        cancelLabel: options.cancelLabel ?? 'Cancel',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        message: options.message,
        resolve,
        title: options.title,
        tone: options.tone ?? 'default',
      })
    })
  }, [])

  const value = useMemo(() => ({ confirm, toast }), [confirm, toast])

  function closeConfirm(confirmed: boolean): void {
    if (!confirmState) return
    confirmState.resolve(confirmed)
    setConfirmState(null)
  }

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}

      {toastState ? (
        <div className={`app-toast app-toast-${toastState.tone}`} role={toastState.tone === 'error' ? 'alert' : 'status'}>
          {toastState.message}
        </div>
      ) : null}

      {confirmState ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label={confirmState.title} onClick={() => closeConfirm(false)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{confirmState.title}</h3>
            <p>{confirmState.message}</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-secondary" onClick={() => closeConfirm(false)}>
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${confirmState.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppFeedbackContext.Provider>
  )
}
