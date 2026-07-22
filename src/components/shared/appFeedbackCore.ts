import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
}

export type AppFeedbackValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  toast: (message: string, tone?: ToastTone) => void
}

export const AppFeedbackContext = createContext<AppFeedbackValue | undefined>(undefined)

export function useAppFeedback() {
  const context = useContext(AppFeedbackContext)
  if (!context) throw new Error('useAppFeedback must be used inside AppFeedbackProvider')
  return context
}
