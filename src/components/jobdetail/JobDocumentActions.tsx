import { FileText, ReceiptText } from 'lucide-react'

type JobDocumentActionsProps = {
  onInvoice: () => void
  onReceipt: () => void
}

export function JobDocumentActions({ onInvoice, onReceipt }: JobDocumentActionsProps) {
  return (
    <article className="job-doc-actions card stack gap-12">
      <div className="stack gap-4">
        <h4>Documents</h4>
        <p>Send an invoice before payment or a receipt after collecting money from the client.</p>
      </div>

      <div className="job-doc-action-grid">
        <button type="button" className="job-doc-action-btn primary" onClick={onInvoice}>
          <FileText size={17} />
          <span>
            <strong>Invoice</strong>
            <small>Request payment</small>
          </span>
        </button>
        <button type="button" className="job-doc-action-btn" onClick={onReceipt}>
          <ReceiptText size={17} />
          <span>
            <strong>Receipt</strong>
            <small>Confirm payment</small>
          </span>
        </button>
      </div>
    </article>
  )
}
