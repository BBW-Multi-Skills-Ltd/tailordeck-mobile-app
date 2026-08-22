import type { ReactNode } from 'react'
import { Sentry } from '../../lib/monitoring'
import { isRecoverableChunkError, recoverFromStaleAppShell } from '../../lib/appRecovery'

function AppErrorFallback() {
  return (
    <main className="min-h-dvh bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
      <section className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center shadow-[var(--clay-shadow-rest)]">
        <img
          className="h-14 w-14 rounded-2xl"
          src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png"
          alt="TailorDeck"
          decoding="async"
        />
        <div className="space-y-2">
          <h1 className="text-2xl font-black">Something went wrong</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Reload TailorDeck. If it repeats, contact support from the Help page.</p>
        </div>
        <button
          type="button"
          className="h-12 w-full rounded-full bg-[var(--primary)] px-5 text-sm font-black text-white shadow-[var(--clay-shadow-primary)]"
          onClick={() => window.location.reload()}
        >
          Reload app
        </button>
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
