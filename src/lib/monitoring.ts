import type { User } from '@supabase/supabase-js'

type SentryModule = typeof import('@sentry/react')

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
let actionTrackerInstalled = false
// Sentry is downloaded only when a DSN is configured, so it never slows app start when reporting is off.
let Sentry: SentryModule | null = null
const pendingErrors: Array<{ error: unknown; context?: Record<string, unknown> }> = []
let latestUser: { user: User | null; loading: boolean } | null = null

type MonitoringAuthState = 'loading' | 'authenticated' | 'anonymous'

type MonitoringContext = {
  authState?: MonitoringAuthState
  path?: string
  plan?: string
}

type LastAction = {
  at: string
  label: string
  path: string
  type: string
}

let currentContext: MonitoringContext = {}
let lastAction: LastAction | null = null

export function initMonitoring() {
  if (!sentryDsn) return

  installActionTracker()
  void import('@sentry/react')
    .then((module) => {
      module.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE,
        replaysOnErrorSampleRate: import.meta.env.PROD ? 0.1 : 0,
        replaysSessionSampleRate: 0,
        tracesSampleRate: import.meta.env.PROD ? 0.05 : 0,
      })
      Sentry = module
      if (latestUser) setMonitoringUser(latestUser.user, latestUser.loading)
      setMonitoringRouteContext(currentContext)
      for (const pending of pendingErrors.splice(0)) reportError(pending.error, pending.context)
    })
    .catch((error) => console.warn('Error monitoring failed to load:', error))
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (!sentryDsn) return
  if (!Sentry) {
    // Errors that happen while Sentry is still downloading are sent once it is ready.
    if (pendingErrors.length < 20) pendingErrors.push({ error, context })
    return
  }
  Sentry.captureException(error, { extra: { ...getBaseErrorContext(), ...context } })
}

export function setMonitoringUser(user: User | null, loading = false) {
  if (!sentryDsn) return
  latestUser = { user, loading }
  if (!Sentry) return

  const authState: MonitoringAuthState = loading ? 'loading' : user ? 'authenticated' : 'anonymous'
  currentContext = { ...currentContext, authState }
  Sentry.setTag('auth_state', authState)

  if (!user) {
    Sentry.setUser(null)
    return
  }

  Sentry.setUser({
    email: user.email,
    id: user.id,
  })
}

export function setMonitoringRouteContext(context: MonitoringContext) {
  if (!sentryDsn) return

  currentContext = { ...currentContext, ...context }
  if (!Sentry) return
  if (context.path) Sentry.setTag('route', context.path)
  if (context.plan) Sentry.setTag('plan', context.plan)
  if (context.authState) Sentry.setTag('auth_state', context.authState)

  Sentry.setContext('tailordeck_state', {
    authState: currentContext.authState ?? 'unknown',
    lastAction,
    path: currentContext.path ?? safePath(),
    plan: currentContext.plan ?? 'unknown',
  })
}

function installActionTracker() {
  if (actionTrackerInstalled || typeof document === 'undefined') return
  actionTrackerInstalled = true

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target.closest('button,a,[role="button"]') : null
      if (!target) return

      const label = getElementLabel(target)
      if (!label) return

      trackAction({
        label,
        path: safePath(),
        type: target.tagName.toLowerCase() === 'a' ? 'link_click' : 'button_click',
      })
    },
    true,
  )
}

function trackAction(action: Omit<LastAction, 'at'>) {
  if (!sentryDsn) return

  lastAction = {
    ...action,
    at: new Date().toISOString(),
  }
  if (!Sentry) return

  Sentry.addBreadcrumb({
    category: 'ui.action',
    data: lastAction,
    level: 'info',
    message: lastAction.label,
  })

  Sentry.setContext('tailordeck_last_action', lastAction)
}

function getElementLabel(element: Element): string {
  const explicit = element.getAttribute('data-monitoring-action') || element.getAttribute('aria-label') || ''
  const text = explicit || element.textContent || ''
  return sanitizeLabel(text)
}

function sanitizeLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 90)
}

function safePath(): string {
  if (typeof window === 'undefined') return 'unknown'
  return window.location.pathname
}

function getBaseErrorContext() {
  return {
    authState: currentContext.authState ?? 'unknown',
    lastAction,
    path: currentContext.path ?? safePath(),
    plan: currentContext.plan ?? 'unknown',
  }
}
