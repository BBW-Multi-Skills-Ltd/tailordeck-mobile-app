import { StrictMode } from 'react'
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
import MonitoringBridge from './components/shared/MonitoringBridge'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

initializeTheme()
initMonitoring()
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppFeedbackProvider>
            <AppErrorBoundary>
              <MonitoringBridge />
              <App />
            </AppErrorBoundary>
          </AppFeedbackProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

const splash = document.getElementById('app-splash')
if (splash) {
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
