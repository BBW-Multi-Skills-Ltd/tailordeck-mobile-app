import { X } from 'lucide-react'
import type { PointerEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { DOCUMENT_PREVIEW_HEIGHT, DOCUMENT_PREVIEW_WIDTH } from './invoiceReceiptConfig'

export function FullDocumentPreviewModal({
  children,
  label,
  onClose,
}: {
  children: ReactNode
  label: string
  onClose: () => void
}) {
  const [zoom, setZoom] = useState(1)

  return (
    <div className="document-preview-modal-overlay" role="dialog" aria-modal="true" aria-label={`${label} full preview`} onClick={onClose}>
      <div className="document-preview-modal" onClick={(event) => event.stopPropagation()}>
        <header className="document-preview-modal-head">
          <p>{label} Preview</p>
          <div className="document-preview-modal-actions">
            <button type="button" className="document-preview-zoom-btn" onClick={() => setZoom((value) => Math.max(0.75, value - 0.15))}>
              -
            </button>
            <button type="button" className="document-preview-zoom-value" onClick={() => setZoom(1)}>
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" className="document-preview-zoom-btn" onClick={() => setZoom((value) => Math.min(1.8, value + 0.15))}>
              +
            </button>
            <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close preview">
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="document-preview-modal-body">
          <ZoomableDocumentPreview zoom={zoom} onZoomChange={setZoom}>{children}</ZoomableDocumentPreview>
        </div>
      </div>
    </div>
  )
}

function clampZoom(value: number): number {
  return Math.min(1.8, Math.max(0.75, value))
}

function pointerDistance(points: Array<{ x: number; y: number }>): number {
  const [first, second] = points
  if (!first || !second) return 0
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function ZoomableDocumentPreview({ children, onZoomChange, zoom }: { children: ReactNode; zoom: number; onZoomChange: (value: number) => void }) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const scale = baseScale * zoom

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = Array.from(pointersRef.current.values())
    if (points.length === 2) {
      pinchStartRef.current = { distance: pointerDistance(points), zoom }
      dragStartRef.current = null
      return
    }

    if (points.length === 1 && zoom > 1) {
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: getScrollContainer(event.currentTarget)?.scrollLeft ?? 0,
        scrollTop: getScrollContainer(event.currentTarget)?.scrollTop ?? 0,
      }
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = Array.from(pointersRef.current.values())
    if (points.length === 1 && dragStartRef.current) {
      const scrollContainer = getScrollContainer(event.currentTarget)
      if (!scrollContainer) return
      event.preventDefault()
      scrollContainer.scrollLeft = dragStartRef.current.scrollLeft + (dragStartRef.current.x - event.clientX)
      scrollContainer.scrollTop = dragStartRef.current.scrollTop + (dragStartRef.current.y - event.clientY)
      return
    }

    if (points.length !== 2 || !pinchStartRef.current) return
    const nextDistance = pointerDistance(points)
    if (!nextDistance || !pinchStartRef.current.distance) return
    onZoomChange(clampZoom(pinchStartRef.current.zoom * (nextDistance / pinchStartRef.current.distance)))
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
    pointersRef.current.delete(event.pointerId)
    if (pointersRef.current.size < 2) pinchStartRef.current = null
    if (pointersRef.current.size === 0) dragStartRef.current = null
  }

  useEffect(() => {
    const node = shellRef.current
    if (!node) return

    const updateScale = () => {
      const availableWidth = node.clientWidth
      if (!availableWidth) return
      setBaseScale(Math.min(1, availableWidth / DOCUMENT_PREVIEW_WIDTH))
    }

    updateScale()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale)
      return () => window.removeEventListener('resize', updateScale)
    }

    const observer = new ResizeObserver(updateScale)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={shellRef}
      className="document-preview-zoom-shell"
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
    >
      <div
        className="document-preview-zoom-space"
        style={{
          height: Math.ceil(DOCUMENT_PREVIEW_HEIGHT * scale),
          width: Math.ceil(DOCUMENT_PREVIEW_WIDTH * scale),
        }}
      >
        <div
          className="document-fit-stage"
          style={{
            height: DOCUMENT_PREVIEW_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: DOCUMENT_PREVIEW_WIDTH,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function getScrollContainer(node: HTMLElement): HTMLElement | null {
  return node.closest('.document-preview-modal-body')
}
