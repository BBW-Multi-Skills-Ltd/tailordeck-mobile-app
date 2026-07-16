import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { ClientsProvider } from './context/ClientsContext'
import { AuthProvider } from './context/AuthContext'
import { initializeTheme } from './lib/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

initializeTheme()

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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ClientsProvider>
            <App />
          </ClientsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

const splash = document.getElementById('app-splash')
if (splash) {
  window.requestAnimationFrame(() => {
    splash.classList.add('is-hidden')
    window.setTimeout(() => splash.remove(), 220)
  })
}
