import type { ReactNode } from 'react'
import { Sentry } from '../../lib/monitoring'
import { isRecoverableChunkError, recoverFromStaleAppShell } from '../../lib/appRecovery'

function AppErrorFallback() {
  return (
    <main className="app-error-page">
      <section className="app-error-card">
        <img
          className="app-error-logo"
          src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png"
          alt="TailorDeck"
          decoding="async"
        />
        <div className="app-error-copy">
          <p className="app-error-eyebrow">App recovery</p>
          <h1>TailorDeck hit a problem</h1>
          <p>Reload the app first. If it repeats, contact support so we can trace it.</p>
        </div>
        <div className="app-error-actions">
          <button type="button" className="btn btn-primary btn-full" onClick={() => window.location.reload()}>
            Reload
          </button>
          <button type="button" className="btn btn-secondary btn-full" onClick={() => window.location.assign('/')}>
            Go Home
          </button>
        </div>
        <a className="app-error-support-link" href="/help?from=crash">
          Contact Support
        </a>
      </section>
    </main>
  )
}

export default function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={<AppErrorFallback />}
      onError={(error) => {
        if (isRecoverableChunkError(error)) void recoverFromStaleAppShell(error)
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
