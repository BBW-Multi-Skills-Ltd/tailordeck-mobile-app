import { useEffect, useRef, useState, type ReactNode } from 'react'

const DOCUMENT_WIDTH = 1120
const DOCUMENT_HEIGHT = 792

type FitDocumentPreviewProps = {
  children: ReactNode
  fitToParentHeight?: boolean
  width?: number
  height?: number
}

export function FitDocumentPreview({
  children,
  fitToParentHeight = false,
  height = DOCUMENT_HEIGHT,
  width = DOCUMENT_WIDTH,
}: FitDocumentPreviewProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const node = shellRef.current
    if (!node) return

    const updateScale = () => {
      const availableWidth = node.clientWidth
      const availableHeight = fitToParentHeight ? node.parentElement?.clientHeight ?? 0 : Infinity
      if (!availableWidth) return
      const heightScale = availableHeight > 0 ? availableHeight / height : 1
      setScale(Math.min(1, availableWidth / width, heightScale))
    }

    updateScale()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale)
      return () => window.removeEventListener('resize', updateScale)
    }

    const observer = new ResizeObserver(updateScale)
    observer.observe(node)
    if (fitToParentHeight && node.parentElement) {
      observer.observe(node.parentElement)
    }
    return () => observer.disconnect()
  }, [fitToParentHeight, height, width])

  return (
    <div
      ref={shellRef}
      className="document-fit-shell"
      style={{ height: Math.ceil(height * scale), width: '100%' }}
    >
      <div
        className="document-fit-stage"
        style={{
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width,
        }}
      >
        {children}
      </div>
    </div>
  )
}
