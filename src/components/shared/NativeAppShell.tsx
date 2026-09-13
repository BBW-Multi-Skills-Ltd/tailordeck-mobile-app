import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const EXIT_PATHS = new Set(['/'])
const AUTH_EXIT_PATHS = new Set(['/onboarding', '/auth/signin'])

function clickOpenCloseControl(): boolean {
  const selectors = [
    '.notification-panel-close',
    '.side-sheet-close',
    '[aria-label="Close notifications"]',
    '[aria-label="Close preview"]',
    '[aria-label="Close"]',
  ]

  for (const selector of selectors) {
    const button = document.querySelector<HTMLButtonElement>(selector)
    if (button && !button.disabled && button.offsetParent !== null) {
      button.click()
      return true
    }
  }

  return false
}

export default function NativeAppShell() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined

    let mounted = true
    let removeListener: (() => void) | undefined

    void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (clickOpenCloseControl()) return

      const path = window.location.pathname
      if (EXIT_PATHS.has(path) || AUTH_EXIT_PATHS.has(path)) {
        void CapacitorApp.minimizeApp()
        return
      }

      if (canGoBack) {
        navigate(-1)
        return
      }

      void CapacitorApp.minimizeApp()
    }).then((handle) => {
      if (!mounted) {
        void handle.remove()
        return
      }
      removeListener = () => {
        void handle.remove()
      }
    })

    return () => {
      mounted = false
      removeListener?.()
    }
  }, [location.key, navigate])

  return null
}
