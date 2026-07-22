import { Eye } from 'lucide-react'
import type { ReactNode } from 'react'
import { FitDocumentPreview } from '../../invoice/FitDocumentPreview'
import { SectionHeader } from './InvoiceSetupProgress'
export { FullDocumentPreviewModal } from './FullDocumentPreviewModal'

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
