import type { AppTheme } from '../lib/theme'

// The marketing website has its own theme setting (default dark, as in the Figma design),
// separate from the app's theme so neither changes the other.
const SITE_THEME_KEY = 'tailordeck-site-theme'

export function getSiteTheme(): AppTheme {
  try {
    return window.localStorage.getItem(SITE_THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applySiteTheme(theme: AppTheme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    window.localStorage.setItem(SITE_THEME_KEY, theme)
  } catch {
    // Theme still applies for this visit.
  }
}

export function toggleSiteTheme(): AppTheme {
  const next: AppTheme = getSiteTheme() === 'dark' ? 'light' : 'dark'
  applySiteTheme(next)
  return next
}
