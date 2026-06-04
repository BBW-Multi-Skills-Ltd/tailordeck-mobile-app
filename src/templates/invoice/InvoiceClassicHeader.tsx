import type { DocumentTemplatePayload } from '../types'

type InvoiceClassicHeaderProps = {
  docIdLabel: string
  docTitle: string
  payload: DocumentTemplatePayload
}

export function InvoiceClassicHeader({ docIdLabel, docTitle, payload }: InvoiceClassicHeaderProps) {
  return (
    <header className="doc-clean-head" style={{ backgroundColor: payload.brand.primaryColor || '#7B1E37' }}>
      <div className="doc-clean-brand">
        {payload.brand.logoUrl ? (
          <img className="doc-clean-logo" src={payload.brand.logoUrl} alt={`${payload.brand.shopName} logo`} />
        ) : (
          <div className="doc-clean-logo-fallback">{(payload.brand.shopName || 'T').charAt(0).toUpperCase()}</div>
        )}
        <div>
          <p className="doc-clean-shop">{payload.brand.shopName || 'TailorDeck Shop'}</p>
          <p className="doc-clean-sub">Professional Tailoring Services</p>
        </div>
      </div>
      <div className="doc-clean-title-wrap">
        <h2>{docTitle}</h2>
        <p>{docIdLabel}: {payload.documentId}</p>
      </div>
    </header>
  )
}
