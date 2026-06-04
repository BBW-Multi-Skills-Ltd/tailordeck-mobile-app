import type { CSSProperties } from 'react'
import type { DocumentTemplatePayload } from '../types'
import { InvoiceClassicFooter } from './InvoiceClassicFooter'
import { InvoiceClassicHeader } from './InvoiceClassicHeader'
import { InvoiceClassicMeta } from './InvoiceClassicMeta'
import { InvoiceClassicTable } from './InvoiceClassicTable'
import { InvoiceClassicTotals } from './InvoiceClassicTotals'
import { getClassicWaveLabels, getClassicWaveLineItems } from './invoiceClassicWaveUtils'

export function InvoiceClassicWaveTemplate(payload: DocumentTemplatePayload) {
  const { docIdLabel, docTitle, dueLabel, isInvoice } = getClassicWaveLabels(payload.kind)

  return (
    <div
      className="doc-wave-root doc-clean-root"
      style={
        {
          '--doc-primary': payload.brand.primaryColor || '#7B1E37',
          '--doc-secondary': payload.brand.secondaryColor || '#F6ECF0',
        } as CSSProperties
      }
    >
      <InvoiceClassicHeader docIdLabel={docIdLabel} docTitle={docTitle} payload={payload} />
      <InvoiceClassicMeta dueLabel={dueLabel} isInvoice={isInvoice} payload={payload} />
      <InvoiceClassicTable lineItems={getClassicWaveLineItems(payload)} />
      <InvoiceClassicTotals isInvoice={isInvoice} payload={payload} />
      <InvoiceClassicFooter payload={payload} />
    </div>
  )
}
