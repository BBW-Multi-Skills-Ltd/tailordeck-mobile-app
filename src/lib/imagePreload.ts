const seenImages = new Set<string>()

function isPreloadableImageUrl(value: string | undefined): value is string {
  if (!value) return false
  if (value.startsWith('data:')) return false
  return value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')
}

export function preloadImage(url: string | undefined): void {
  if (typeof window === 'undefined' || !isPreloadableImageUrl(url) || seenImages.has(url)) return

  seenImages.add(url)
  const image = new Image()
  image.decoding = 'async'
  image.src = url

  if (typeof image.decode === 'function') {
    image.decode().catch(() => {
      // A failed preload should never block the UI; the normal <img> request can still retry.
    })
  }
}

export function preloadImages(urls: Array<string | undefined>): void {
  urls.forEach(preloadImage)
}
