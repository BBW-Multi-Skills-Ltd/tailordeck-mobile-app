import { formatNaira } from '../../lib/utils'
import type { DocumentTemplateLineItem } from '../types'

type InvoiceClassicTableProps = {
  lineItems: DocumentTemplateLineItem[]
}

export function InvoiceClassicTable({ lineItems }: InvoiceClassicTableProps) {
  return (
    <section className="doc-clean-table-wrap">
      <div className="doc-clean-table-head">
        <p>Description</p>
        <p>Qty</p>
        <p>Unit Price</p>
        <p>Total</p>
      </div>
      {lineItems.map((item, idx) => (
        <div className="doc-clean-table-row" key={`${item.description}-${idx}`}>
          <div className="doc-clean-desc">
            <p className="doc-clean-desc-title">{item.description}</p>
            {item.details ? <p className="doc-clean-desc-sub">{item.details}</p> : null}
          </div>
          <p>{item.qty}</p>
          <p>{formatNaira(item.unitPrice)}</p>
          <p>{formatNaira(item.total)}</p>
        </div>
      ))}
    </section>
  )
}
