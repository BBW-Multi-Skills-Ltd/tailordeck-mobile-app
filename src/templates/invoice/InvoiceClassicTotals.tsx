import { formatNaira } from '../../lib/utils'
import type { DocumentTemplatePayload } from '../types'

type InvoiceClassicTotalsProps = {
  isInvoice: boolean
  payload: DocumentTemplatePayload
}

export function InvoiceClassicTotals({ isInvoice, payload }: InvoiceClassicTotalsProps) {
  return (
    <section className="doc-clean-totals">
      <div className="doc-clean-total-row">
        <p>Charge</p>
        <p>{formatNaira(payload.charge)}</p>
      </div>
      <div className="doc-clean-total-row">
        <p>{isInvoice ? 'Deposit to be made' : 'Deposit paid'}</p>
        <p>{formatNaira(payload.deposit)}</p>
      </div>
      <div className="doc-clean-total-row doc-clean-total-row-strong">
        <p>{isInvoice ? 'Balance Due' : 'Balance'}</p>
        <p>{formatNaira(payload.balance)}</p>
      </div>
    </section>
  )
}
