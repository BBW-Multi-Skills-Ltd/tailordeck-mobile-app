import { CheckCircle2, FileText, ReceiptText } from 'lucide-react'

type JobDocumentActionsProps = {
  invoiceSent: boolean
  onInvoice: () => void
  onReceipt: () => void
  receiptSent: boolean
}

export function JobDocumentActions({ invoiceSent, onInvoice, onReceipt, receiptSent }: JobDocumentActionsProps) {
  return (
    <article className="job-doc-actions card stack gap-12">
      <h4>Documents</h4>

      <div className="job-doc-action-grid">
        <button type="button" className="job-doc-action-btn primary" onClick={onInvoice} disabled={invoiceSent}>
          {invoiceSent ? <CheckCircle2 size={17} /> : <FileText size={17} />}
          <span>
            <strong>{invoiceSent ? 'Invoice Sent' : 'Send Invoice'}</strong>
          </span>
        </button>
        <button type="button" className="job-doc-action-btn" onClick={onReceipt} disabled={receiptSent}>
          {receiptSent ? <CheckCircle2 size={17} /> : <ReceiptText size={17} />}
          <span>
            <strong>{receiptSent ? 'Receipt Sent' : 'Send Receipt'}</strong>
          </span>
        </button>
      </div>
    </article>
  )
}
