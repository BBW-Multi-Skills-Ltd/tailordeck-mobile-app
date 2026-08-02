import * as Sentry from '@sentry/react'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN

export function initMonitoring() {
  if (!sentryDsn) return

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 0.1 : 0,
    replaysSessionSampleRate: 0,
    tracesSampleRate: import.meta.env.PROD ? 0.05 : 0,
  })
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (!sentryDsn) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}

export { Sentry }
