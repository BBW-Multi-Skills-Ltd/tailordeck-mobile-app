import { Share2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useState, type RefObject } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import type { DetailedJobData } from '../../types/jobDetails'
import type { DocumentTemplateLineItem } from '../../templates/types'
import type { MockJob } from '../../types/job'
import { DocumentPreview } from '../invoice/DocumentPreview'
import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'
import { buildDocumentNumber } from './jobDocumentHelpers'
import { buildJobDocumentPdfBlob } from './jobPdfExport'

export function JobDocumentDrawer({
  type,
  brand,
  job,
  details,
  balanceToCollect,
  docPreviewRef,
  onClose,
  onShare,
  onWhatsApp,
}: {
  type: InvoiceType
  brand: BrandConfig
  job: MockJob
  details: DetailedJobData
  balanceToCollect: number
  docPreviewRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onShare: (type: InvoiceType, preparedBlob?: Blob | null) => Promise<void> | void
  onWhatsApp: (type: InvoiceType, preparedBlob?: Blob | null) => Promise<void> | void
}) {
  const lineItems = buildClientFacingLineItems({ details, job })
  const [zoom, setZoom] = useState(1)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfPreparing, setPdfPreparing] = useState(true)
  const [pdfAction, setPdfAction] = useState<'share' | 'whatsapp' | null>(null)
  const [pdfError, setPdfError] = useState('')
  const zoomPercent = Math.round(zoom * 100)
  const pdfReady = Boolean(pdfBlob) && !pdfPreparing

  useEffect(() => {
    let cancelled = false

    async function preparePdf(): Promise<void> {
      try {
        setPdfPreparing(true)
        setPdfError('')
        setPdfBlob(null)
        await new Promise((resolve) => window.requestAnimationFrame(resolve))
        const blob = await buildJobDocumentPdfBlob(docPreviewRef.current)
        if (cancelled) return
        if (!blob) {
          setPdfError('Unable to prepare this PDF. Close and try again.')
          return
        }
        setPdfBlob(blob)
      } catch {
        if (!cancelled) setPdfError('Unable to prepare this PDF. Close and try again.')
      } finally {
        if (!cancelled) setPdfPreparing(false)
      }
    }

    void preparePdf()

    return () => {
      cancelled = true
    }
  }, [docPreviewRef, type])

  async function runPdfAction(action: 'share' | 'whatsapp'): Promise<void> {
    if (!pdfReady) return
    try {
      setPdfAction(action)
      setPdfError('')
      if (action === 'share') {
        await onShare(type, pdfBlob)
      } else {
        await onWhatsApp(type, pdfBlob)
      }
    } catch {
      setPdfError('Unable to share this PDF. Please try again.')
    } finally {
      setPdfAction(null)
    }
  }

  return (
    <div
      className="side-sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${type} preview`}
      onClick={onClose}
    >
      <aside className="side-sheet" onClick={(event) => event.stopPropagation()}>
        <header className="side-sheet-header">
          <h4 className="side-sheet-title">{type === 'invoice' ? 'Invoice Preview' : 'Receipt Preview'}</h4>
          <button type="button" className="btn btn-ghost btn-icon side-sheet-close" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>
        </header>

        <div className="side-sheet-body">
          <div className="side-sheet-preview-toolbar" aria-label="Document preview zoom controls">
            <span>Preview</span>
            <div>
              <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.15))} aria-label="Zoom out">
                <ZoomOut size={14} />
              </button>
              <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom">
                {zoomPercent}%
              </button>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.8, value + 0.15))} aria-label="Zoom in">
                <ZoomIn size={14} />
              </button>
            </div>
          </div>

          <div className="job-doc-fullbleed side-sheet-doc-preview">
            <div ref={docPreviewRef} className="side-sheet-doc-zoom-space" style={{ width: `${zoom * 100}%` }}>
              <DocumentPreview
                type={type}
                brand={brand}
                clientName={job.clientName}
                clientPhone={job.clientPhone}
                service={details.itemType}
                lineItems={lineItems}
                charge={job.chargeAmount}
                deposit={details.depositAmount}
                balance={balanceToCollect}
                deadlineDate={job.deadlineDate}
                documentNumber={buildDocumentNumber(type, job.id)}
              />
            </div>
          </div>

          {pdfError ? <p className="inline-error side-sheet-pdf-error">{pdfError}</p> : null}

          <div className="stack gap-8 side-sheet-actions">
            <button
              type="button"
              className="btn btn-primary btn-full"
              disabled={!pdfReady || pdfAction !== null}
              onClick={() => void runPdfAction('share')}
            >
              <Share2 size={16} />
              {pdfPreparing ? 'Preparing PDF...' : pdfAction === 'share' ? 'Opening Share...' : 'Share PDF'}
            </button>
            <button
              type="button"
              className="btn btn-full whatsapp-send-btn"
              disabled={!pdfReady || pdfAction !== null}
              onClick={() => void runPdfAction('whatsapp')}
            >
              <FaWhatsapp size={18} />
              {pdfPreparing ? 'Preparing PDF...' : pdfAction === 'whatsapp' ? 'Opening WhatsApp...' : 'Send PDF to Client'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function buildClientFacingLineItems({
  details,
  job,
}: {
  details: DetailedJobData
  job: MockJob
}): DocumentTemplateLineItem[] {
  const descriptionParts = [
    details.orderMode,
    details.jobType,
    details.orderScope,
    details.materialType && details.materialType !== '-' ? `Material: ${details.materialType}` : '',
    details.color && details.color !== '-' ? `Color: ${details.color}` : '',
    details.totalYard && details.totalYard !== '0' ? `${details.totalYard} yards` : '',
    details.materialQuality ? `Quality: ${details.materialQuality}` : '',
    details.materialSource && details.materialSource !== '-' ? `Source: ${details.materialSource}` : '',
  ].filter(Boolean)

  return [
    {
      description: details.itemType || job.title || 'Tailoring service',
      details: descriptionParts.join(' | '),
      qty: 1,
      unitPrice: job.chargeAmount,
      total: job.chargeAmount,
    },
  ]
}
