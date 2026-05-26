export type AppTheme = 'light' | 'dark'

export const TAILOR_THEME_KEY = 'tailordeck-theme'

export function getSavedTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light'
  const raw = window.localStorage.getItem(TAILOR_THEME_KEY)
  return raw === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: AppTheme): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem(TAILOR_THEME_KEY, theme)
  window.dispatchEvent(new Event('tailordeck-theme-updated'))
}

export function initializeTheme(): AppTheme {
  const theme = getSavedTheme()
  applyTheme(theme)
  return theme
}

export function toggleTheme(): AppTheme {
  const next: AppTheme = getSavedTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
