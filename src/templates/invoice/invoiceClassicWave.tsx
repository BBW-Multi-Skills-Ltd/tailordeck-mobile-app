import { formatDateShort, formatNaira } from '../../lib/utils'
import type { DocumentTemplatePayload } from '../types'

export function InvoiceClassicWaveTemplate(payload: DocumentTemplatePayload) {
  const { brand } = payload
  const show = brand.includeBusinessDetails

  return (
    <div className="doc-wave-root">
      <div className="doc-wave-header" style={{ background: brand.primaryColor }}>
        <div className="doc-wave-header-overlay" />
        <div className="doc-wave-header-content">
          <div className="doc-wave-brand">
            {brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.shopName} logo`} className="doc-wave-logo" /> : null}
            <p className="doc-wave-brand-name">{brand.shopName}</p>
          </div>
          <div className="doc-wave-contact-grid">
            {show.phone ? <p>Phone: {brand.businessPhone || '-'}</p> : null}
            {show.email ? <p>Email: {brand.businessEmail || '-'}</p> : null}
            {show.website ? <p>Web: {brand.website || '-'}</p> : null}
            {show.address ? <p>Address: {brand.shopAddress || '-'}</p> : null}
          </div>
        </div>
      </div>

      <div className="doc-wave-wave-band" style={{ background: brand.secondaryColor }} />
      <div className="doc-wave-wave-band second" style={{ background: brand.accentColor }} />

      <div className="doc-wave-body">
        <div className="doc-wave-top">
          <div className="doc-wave-to">
            <p className="doc-wave-label">To:</p>
            <p className="doc-wave-strong">{payload.clientName}</p>
            <p className="doc-wave-muted">{payload.clientPhone}</p>
          </div>

          <div className="doc-wave-title-block">
            <h2 className="doc-wave-title">INVOICE</h2>
            <div className="doc-wave-meta">
              <p>Invoice No: {payload.documentId}</p>
              <p>Date: {payload.issuedDate}</p>
              <p>Delivery: {formatDateShort(payload.deadlineDate)}</p>
            </div>
          </div>
        </div>

        <div className="doc-wave-table">
          <div className="doc-wave-table-head" style={{ background: brand.accentColor }}>
            <p>ITEM DESCRIPTION</p>
            <p>PRICE</p>
            <p>QTY</p>
            <p>TOTAL</p>
          </div>
          <div className="doc-wave-table-row">
            <p>{payload.service}</p>
            <p>{formatNaira(payload.charge)}</p>
            <p>1</p>
            <p>{formatNaira(payload.charge)}</p>
          </div>
        </div>

        <div className="doc-wave-summary">
          <div className="doc-wave-summary-lines">
            <p>Sub Total</p>
            <p>{formatNaira(payload.charge)}</p>
          </div>
          <div className="doc-wave-summary-lines">
            <p>Deposit</p>
            <p>{formatNaira(payload.deposit)}</p>
          </div>
          <div className="doc-wave-summary-total" style={{ background: brand.accentColor }}>
            <p>GRAND TOTAL</p>
            <p>{formatNaira(payload.kind === 'invoice' ? payload.balance : payload.charge)}</p>
          </div>
        </div>

        <div className="doc-wave-footer">
          <p className="doc-wave-thanks">Thank you for your business!</p>
          {brand.signatureUrl ? <img src={brand.signatureUrl} alt="Signature" className="doc-wave-signature" /> : null}
          {show.social && brand.socialHandles.length ? (
            <p className="doc-wave-muted">{brand.socialHandles.map((item) => `${item.platform}: ${item.handle}`).join(' • ')}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

