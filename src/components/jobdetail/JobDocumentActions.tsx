import { CheckCircle2, FileText, Lock, ReceiptText } from 'lucide-react'

type JobDocumentActionsProps = {
  locked?: boolean
  invoiceSent: boolean
  onInvoice: () => void
  onReceipt: () => void
  receiptSent: boolean
}

export function JobDocumentActions({ invoiceSent, locked = false, onInvoice, onReceipt, receiptSent }: JobDocumentActionsProps) {
  return (
    <article className="job-doc-actions card stack gap-12">
      <h4>Documents</h4>
      {locked ? <p className="text-muted">Upgrade to Pro to send PDF invoices and receipts.</p> : null}

      <div className="job-doc-action-grid">
        <button type="button" className="job-doc-action-btn primary" onClick={onInvoice} disabled={invoiceSent}>
          {locked ? <Lock size={17} /> : invoiceSent ? <CheckCircle2 size={17} /> : <FileText size={17} />}
          <span>
            <strong>{invoiceSent ? 'Invoice Sent' : 'Send Invoice'}</strong>
          </span>
        </button>
        <button type="button" className="job-doc-action-btn" onClick={onReceipt} disabled={receiptSent}>
          {locked ? <Lock size={17} /> : receiptSent ? <CheckCircle2 size={17} /> : <ReceiptText size={17} />}
          <span>
            <strong>{receiptSent ? 'Receipt Sent' : 'Send Receipt'}</strong>
          </span>
        </button>
      </div>
    </article>
  )
}
