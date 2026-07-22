import { Eye, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { FitDocumentPreview } from '../../invoice/FitDocumentPreview'
import { DOCUMENT_PREVIEW_HEIGHT, DOCUMENT_PREVIEW_WIDTH } from './invoiceReceiptConfig'
import { SectionHeader } from './InvoiceSetupProgress'

export function LiveDocumentPreviewSection({
  invoicePreview,
  onOpen,
  receiptPreview,
}: {
  invoicePreview: ReactNode
  receiptPreview: ReactNode
  onOpen: (kind: 'invoice' | 'receipt') => void
}) {
  return (
    <section className="settings-document-section">
      <SectionHeader title="Live Document Preview" helper="Swipe to view invoice or receipt." />
      <div className="settings-document-preview-strip" aria-label="Invoice and receipt live previews">
        <DocumentPreviewCard label="Invoice" onOpen={() => onOpen('invoice')}>{invoicePreview}</DocumentPreviewCard>
        <DocumentPreviewCard label="Receipt" onOpen={() => onOpen('receipt')}>{receiptPreview}</DocumentPreviewCard>
      </div>
    </section>
  )
}

function DocumentPreviewCard({ children, label, onOpen }: { children: ReactNode; label: string; onOpen: () => void }) {
  return (
    <article className="settings-document-preview-card">
      <div className="row-between settings-document-preview-card-head">
        <p>{label}</p>
        <button type="button" className="settings-document-open-btn" onClick={onOpen}>
          <Eye size={13} />
          Open
        </button>
      </div>
      <div className="settings-document-preview-paper">
        <FitDocumentPreview>{children}</FitDocumentPreview>
      </div>
    </article>
  )
}

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
          <ZoomableDocumentPreview zoom={zoom}>{children}</ZoomableDocumentPreview>
        </div>
      </div>
    </div>
  )
}

function ZoomableDocumentPreview({ children, zoom }: { children: ReactNode; zoom: number }) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const scale = baseScale * zoom

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
    <div ref={shellRef} className="document-preview-zoom-shell">
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
