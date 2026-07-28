import { useEffect, useState } from 'react'
import { getSavedTheme, toggleTheme } from '../../lib/theme'

export function useSettingsTheme() {
  const [theme, setTheme] = useState(() => getSavedTheme())

  useEffect(() => {
    function syncTheme() {
      setTheme(getSavedTheme())
    }

    window.addEventListener('storage', syncTheme)
    window.addEventListener('tailordeck-theme-updated', syncTheme)
    return () => {
      window.removeEventListener('storage', syncTheme)
      window.removeEventListener('tailordeck-theme-updated', syncTheme)
    }
  }, [])

  return {
    setTheme: () => {
      const nextTheme = toggleTheme()
      setTheme(nextTheme)
      return nextTheme
    },
    theme,
  }
}
