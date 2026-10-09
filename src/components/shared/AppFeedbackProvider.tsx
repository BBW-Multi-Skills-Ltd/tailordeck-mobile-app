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
  passwordCheck?: ConfirmOptions['passwordCheck']
  resolve: (confirmed: boolean) => void
} | null

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        cancelLabel: options.cancelLabel ?? 'Cancel',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        message: options.message,
        passwordCheck: options.passwordCheck,
        requiredText: options.requiredText,
        requiredTextLabel: options.requiredTextLabel,
        resolve,
        title: options.title,
        tone: options.tone ?? 'default',
      })
      setConfirmInput('')
      setPasswordInput('')
      setPasswordError('')
    })
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  function closeConfirm(confirmed: boolean): void {
    if (!confirmState || verifying) return
    confirmState.resolve(confirmed)
    setConfirmState(null)
    setConfirmInput('')
    setPasswordInput('')
    setPasswordError('')
  }

  async function handleConfirm(): Promise<void> {
    if (!confirmState?.passwordCheck) {
      closeConfirm(true)
      return
    }
    setVerifying(true)
    setPasswordError('')
    try {
      const problem = await confirmState.passwordCheck.verify(passwordInput)
      if (problem) {
        setPasswordError(problem)
        return
      }
    } finally {
      setVerifying(false)
    }
    confirmState.resolve(true)
    setConfirmState(null)
    setConfirmInput('')
    setPasswordInput('')
  }

  const confirmInputMatches = !confirmState?.requiredText || confirmInput.trim() === confirmState.requiredText
  const passwordReady = !confirmState?.passwordCheck || passwordInput.length > 0

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
            {confirmState.passwordCheck ? (
              <label className="confirm-required-input-wrap">
                <span>{confirmState.passwordCheck.label}</span>
                <input
                  type="password"
                  className={`auth-input confirm-required-input${passwordError ? ' input-invalid' : ''}`}
                  value={passwordInput}
                  onChange={(event) => {
                    setPasswordInput(event.target.value)
                    setPasswordError('')
                  }}
                  autoComplete="current-password"
                />
                {passwordError ? (
                  <span className="input-error-text" role="alert">
                    {passwordError}
                  </span>
                ) : null}
              </label>
            ) : null}
            <div className="confirm-actions">
              <button type="button" className="btn btn-secondary" disabled={verifying} onClick={() => closeConfirm(false)}>
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${confirmState.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                disabled={!confirmInputMatches || !passwordReady || verifying}
                onClick={() => void handleConfirm()}
              >
                {verifying ? 'Checking...' : confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppFeedbackContext.Provider>
  )
}
