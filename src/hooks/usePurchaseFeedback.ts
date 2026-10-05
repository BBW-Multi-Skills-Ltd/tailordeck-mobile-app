import { useCallback, useEffect, useState } from 'react'
import { getServiceErrorMessage, PurchaseCancelledError } from '../services/serviceHelpers'

const CANCELLED_FEEDBACK_MS = 5000

type Feedback = { message: string; autoDismiss: boolean }

/**
 * Checkout error state for plan screens. A cancelled Google Play sheet is dismissed after 5 seconds;
 * real failures (including "payment received but not confirmed") stay until the next action.
 */
export function usePurchaseFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    if (!feedback?.autoDismiss) return
    const timer = window.setTimeout(() => setFeedback(null), CANCELLED_FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const showError = useCallback((error: unknown, fallback: string) => {
    setFeedback({
      message: getServiceErrorMessage(error, fallback),
      autoDismiss: error instanceof PurchaseCancelledError,
    })
  }, [])

  const clear = useCallback(() => setFeedback(null), [])

  return { message: feedback?.message ?? '', showError, clear }
}
