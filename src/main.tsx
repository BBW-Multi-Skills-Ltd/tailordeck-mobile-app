import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { initializeTheme } from './lib/theme'
import { initMonitoring } from './lib/monitoring'
import { installAppRecoveryHandlers } from './lib/appRecovery'
import ScrollToTop from './components/layout/ScrollToTop'
import { AppFeedbackProvider } from './components/shared/AppFeedbackProvider'
import AppErrorBoundary from './components/shared/AppErrorBoundary'
import ConnectivityStatus from './components/shared/ConnectivityStatus'
import MonitoringBridge from './components/shared/MonitoringBridge'
import NativeAppShell from './components/shared/NativeAppShell'
import NativeNotificationBridge from './components/shared/NativeNotificationBridge'
import { isFullAppAllowed } from './lib/webAccess'
import MarketingApp from './marketing/LazyMarketingApp'

/** People who installed the old web app (PWA) get its offline cache removed so they see the current site. */
async function removeInstalledWebApp(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
    }
  } catch {
    // Best effort only.
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

initializeTheme()
// Crash reporting is for the app only; the marketing website does not need it.
if (isFullAppAllowed()) initMonitoring()
installAppRecoveryHandlers()

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister()
      })
    })

    if ('caches' in window) {
      void caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          void caches.delete(cacheName)
        })
      })
    }
  })
}

const fullAppAllowed = isFullAppAllowed()
if (!fullAppAllowed) {
  void removeInstalledWebApp()
  // The app is phone-width only (#root max-width); the marketing site needs the full desktop width.
  document.getElementById('root')?.classList.add('mk-root')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      {fullAppAllowed ? (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppFeedbackProvider>
              <AppErrorBoundary>
                <NativeAppShell />
                <ConnectivityStatus />
                <MonitoringBridge />
                <NativeNotificationBridge />
                <App />
              </AppErrorBoundary>
            </AppFeedbackProvider>
          </AuthProvider>
        </QueryClientProvider>
      ) : (
        <AppErrorBoundary>
          <Suspense fallback={null}>
            <MarketingApp />
          </Suspense>
        </AppErrorBoundary>
      )}
    </BrowserRouter>
  </StrictMode>,
)

const splash = document.getElementById('app-splash')
if (splash && !fullAppAllowed) {
  splash.remove()
} else if (splash) {
  let splashRemoved = false

  const removeSplash = () => {
    if (splashRemoved) return
    splashRemoved = true
    splash.classList.add('is-hidden')
    window.setTimeout(() => splash.remove(), 220)
  }

  const isPublicBootPath = window.location.pathname.startsWith('/auth') || window.location.pathname.startsWith('/onboarding')

  if (isPublicBootPath) {
    window.requestAnimationFrame(removeSplash)
  } else {
    window.addEventListener('tailordeck:app-ready', removeSplash, { once: true })
    window.setTimeout(removeSplash, 3500)
  }
}
