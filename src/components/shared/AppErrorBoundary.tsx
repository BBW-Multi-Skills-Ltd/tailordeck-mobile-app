import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '../../lib/monitoring'
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

/**
 * Catches render crashes and shows the recovery screen. Plain React (not Sentry.ErrorBoundary) so the
 * Sentry library is only downloaded when error reporting is configured; crashes are still reported to it.
 */
export default class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isRecoverableChunkError(error)) void recoverFromStaleAppShell(error)
    reportError(error, { componentStack: info.componentStack })
  }

  render() {
    return this.state.hasError ? <AppErrorFallback /> : this.props.children
  }
}
