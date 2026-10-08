import { useEffect } from 'react'
import { useAppSettings } from '../../hooks/useSettingsQueries'
import { preloadImages } from '../../lib/imagePreload'

/** Settings for the app header; preloads the avatar, logo and signature once they are known. */
export function useSyncedHeaderSettings() {
  const settings = useAppSettings()

  useEffect(() => {
    preloadImages([settings.profile.avatarUrl, settings.brand.logoUrl, settings.brand.signatureUrl])
  }, [settings.brand.logoUrl, settings.brand.signatureUrl, settings.profile.avatarUrl])

  return settings
}
