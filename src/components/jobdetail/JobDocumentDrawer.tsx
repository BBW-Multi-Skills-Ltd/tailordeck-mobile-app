import { Share2, X } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import type { RefObject } from 'react'
import type { DetailedJobData } from '../../types/jobDetails'
import type { DocumentTemplateLineItem } from '../../templates/types'
import type { MockJob } from '../../types/job'
import { DocumentPreview } from '../invoice/DocumentPreview'
import type { BrandConfig, InvoiceType } from '../invoice/documentTypes'

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
  onDownload,
}: {
  type: InvoiceType
  brand: BrandConfig
  job: MockJob
  details: DetailedJobData
  balanceToCollect: number
  docPreviewRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onShare: (type: InvoiceType) => void
  onWhatsApp: (type: InvoiceType) => void
  onDownload: (type: InvoiceType) => void
}) {
  const lineItems = buildClientFacingLineItems({ details, job })

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
          <div ref={docPreviewRef} className="job-doc-fullbleed side-sheet-doc-preview">
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
            />
          </div>

          <div className="stack gap-8 side-sheet-actions">
            <button type="button" className="btn btn-primary btn-full" onClick={() => onShare(type)}>
              <Share2 size={16} />
              Share PDF
            </button>
            <button type="button" className="btn btn-full whatsapp-send-btn" onClick={() => onWhatsApp(type)}>
              <FaWhatsapp size={18} />
              Send PDF to Client
            </button>
            <button type="button" className="btn btn-secondary btn-full" onClick={() => onDownload(type)}>
              Download PDF
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
