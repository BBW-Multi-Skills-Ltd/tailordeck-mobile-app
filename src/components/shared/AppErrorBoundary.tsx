import type { ReactNode } from 'react'
import { Sentry } from '../../lib/monitoring'

function AppErrorFallback() {
  return (
    <main className="min-h-dvh bg-[var(--color-background)] px-6 py-12 text-[var(--color-text)]">
      <section className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[2rem] border border-[var(--color-border)] bg-white/85 p-6 text-center shadow-[var(--clay-shadow-rest)]">
        <img className="h-16 w-16 rounded-2xl" src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png" alt="TailorDeck" />
        <div className="space-y-2">
          <h1 className="text-2xl font-black">Something went wrong</h1>
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">Reload TailorDeck. If it repeats, contact support from the Help page.</p>
        </div>
        <button
          type="button"
          className="h-12 w-full rounded-full bg-[var(--color-primary)] px-5 text-sm font-black text-white shadow-[var(--clay-shadow-primary)]"
          onClick={() => window.location.reload()}
        >
          Reload app
        </button>
      </section>
    </main>
  )
}

export default function AppErrorBoundary({ children }: { children: ReactNode }) {
  return <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>{children}</Sentry.ErrorBoundary>
}
