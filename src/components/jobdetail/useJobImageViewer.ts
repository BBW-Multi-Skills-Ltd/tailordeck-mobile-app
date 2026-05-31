import { useEffect } from 'react'

export function useJobImageViewer({
  viewerIndex,
  photoCount,
  setViewerIndex,
}: {
  viewerIndex: number | null
  photoCount: number
  setViewerIndex: (updater: number | null | ((prev: number | null) => number | null)) => void
}): void {
  useEffect(() => {
    if (viewerIndex === null) return

    function handleKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setViewerIndex(null)
        return
      }

      if (!photoCount) return

      if (event.key === 'ArrowRight') {
        setViewerIndex((prev) => (prev === null ? 0 : (prev + 1) % photoCount))
      }

      if (event.key === 'ArrowLeft') {
        setViewerIndex((prev) => (prev === null ? 0 : (prev - 1 + photoCount) % photoCount))
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [viewerIndex, photoCount, setViewerIndex])
}
