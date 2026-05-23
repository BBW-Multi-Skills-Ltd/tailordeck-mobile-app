import { formatDateShort, formatNaira } from '../../lib/utils'
import type { DocumentTemplatePayload } from '../types'

export function SimpleDocumentTemplate(payload: DocumentTemplatePayload, title: string) {
  const { brand } = payload
  const show = brand.includeBusinessDetails

  return (
    <div className="doc-simple-root">
      <div className="doc-simple-head" style={{ background: brand.primaryColor }}>
        <div className="doc-simple-brand">
          {brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.shopName} logo`} className="doc-simple-logo" /> : null}
          <p>{brand.shopName}</p>
        </div>
        <p className="doc-simple-title">{title}</p>
      </div>

      <div className="doc-simple-body">
        <div className="doc-simple-row">
          <p>Client</p>
          <p>{payload.clientName}</p>
        </div>
        <div className="doc-simple-row">
          <p>Phone</p>
          <p>{payload.clientPhone}</p>
        </div>
        <div className="doc-simple-row">
          <p>Document ID</p>
          <p>{payload.documentId}</p>
        </div>
        <div className="doc-simple-row">
          <p>Date</p>
          <p>{payload.issuedDate}</p>
        </div>
        <div className="doc-simple-row">
          <p>Service</p>
          <p>{payload.service}</p>
        </div>

        <div className="doc-simple-divider" />

        <div className="doc-simple-row">
          <p>Charge</p>
          <p>{formatNaira(payload.charge)}</p>
        </div>
        <div className="doc-simple-row">
          <p>Deposit</p>
          <p>{formatNaira(payload.deposit)}</p>
        </div>
        <div className="doc-simple-row strong">
          <p>{payload.kind === 'invoice' ? 'Balance' : 'Amount Received'}</p>
          <p>{formatNaira(payload.kind === 'invoice' ? payload.balance : payload.charge)}</p>
        </div>
        <div className="doc-simple-row">
          <p>Delivery</p>
          <p>{formatDateShort(payload.deadlineDate)}</p>
        </div>
      </div>

      <div className="doc-simple-foot">
        {show.phone ? <p>{brand.businessPhone}</p> : null}
        {show.email ? <p>{brand.businessEmail}</p> : null}
        {show.website ? <p>{brand.website}</p> : null}
      </div>
    </div>
  )
}

