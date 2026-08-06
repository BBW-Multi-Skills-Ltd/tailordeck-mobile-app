import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AppFeedbackContext, type ConfirmOptions } from './appFeedbackCore'

type ConfirmState = {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  requiredText?: string
  requiredTextLabel?: string
  tone: 'default' | 'danger'
  resolve: (confirmed: boolean) => void
} | null

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const [confirmInput, setConfirmInput] = useState('')

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        cancelLabel: options.cancelLabel ?? 'Cancel',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        message: options.message,
        requiredText: options.requiredText,
        requiredTextLabel: options.requiredTextLabel,
        resolve,
        title: options.title,
        tone: options.tone ?? 'default',
      })
      setConfirmInput('')
    })
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  function closeConfirm(confirmed: boolean): void {
    if (!confirmState) return
    confirmState.resolve(confirmed)
    setConfirmState(null)
    setConfirmInput('')
  }

  const confirmInputMatches = !confirmState?.requiredText || confirmInput.trim() === confirmState.requiredText

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}

      {confirmState ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label={confirmState.title} onClick={() => closeConfirm(false)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{confirmState.title}</h3>
            <p>{confirmState.message}</p>
            {confirmState.requiredText ? (
              <label className="confirm-required-input-wrap">
                <span>
                  {confirmState.requiredTextLabel ?? 'Type'}{' '}
                  <strong className="confirm-required-token">&quot;{confirmState.requiredText}&quot;</strong>
                  {' '}to continue.
                </span>
                <input
                  type="text"
                  className="auth-input confirm-required-input"
                  value={confirmInput}
                  onChange={(event) => setConfirmInput(event.target.value)}
                  autoComplete="off"
                />
              </label>
            ) : null}
            <div className="confirm-actions">
              <button type="button" className="btn btn-secondary" onClick={() => closeConfirm(false)}>
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${confirmState.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                disabled={!confirmInputMatches}
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
