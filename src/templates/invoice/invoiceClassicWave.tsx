import type { DocumentTemplatePayload } from '../types'
import { formatDateShort, formatNaira } from '../../lib/utils'
import { Globe, Mail, MapPin, PhoneCall } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6'
import type { CSSProperties } from 'react'

export function InvoiceClassicWaveTemplate(payload: DocumentTemplatePayload) {
  const isInvoice = payload.kind === 'invoice'
  const docTitle = isInvoice ? 'Invoice' : 'Receipt'
  const docIdLabel = isInvoice ? 'Invoice No' : 'Receipt No'
  const dueLabel = isInvoice ? 'Due Date' : 'Issued Date'

  const website = payload.brand.website || 'www.tailordeck.app'
  const businessPhone = payload.brand.businessPhone || '+234 000 000 0000'
  const businessEmail = payload.brand.businessEmail || 'hello@tailordeck.app'
  const businessAddress = payload.brand.shopAddress || 'Lagos, Nigeria'
  const details = payload.brand.includeBusinessDetails
  const socialHandles = details.social ? payload.brand.socialHandles : []

  const lineItems =
    payload.lineItems && payload.lineItems.length > 0
      ? payload.lineItems
      : [
          {
            description: payload.service || 'Tailoring service',
            details: '',
            qty: 1,
            unitPrice: payload.charge,
            total: payload.charge,
          },
        ]

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

      <section className="doc-clean-meta">
        <div className="doc-clean-block">
          <p className="doc-clean-label">{isInvoice ? 'Invoice To' : 'Receipt For'}</p>
          <p className="doc-clean-strong">{payload.clientName || 'Client Name'}</p>
          <p>{payload.clientPhone || '+234 000 000 0000'}</p>
        </div>

        <div className="doc-clean-block">
          <p className="doc-clean-label">Contact</p>
          {details.address ? (
            <p className="doc-clean-contact-line">
              <MapPin size={12} />
              <span>Address: {businessAddress}</span>
            </p>
          ) : null}
          {details.phone ? (
            <p className="doc-clean-contact-line">
              <PhoneCall size={12} />
              <span>Call: {businessPhone}</span>
            </p>
          ) : null}
          {details.email ? (
            <p className="doc-clean-contact-line">
              <Mail size={12} />
              <span>Email us at: {businessEmail}</span>
            </p>
          ) : null}
          {details.website ? (
            <p className="doc-clean-contact-line">
              <Globe size={12} />
              <span>Visit our website: {website}</span>
            </p>
          ) : null}
        </div>

        <div className="doc-clean-block doc-clean-dates">
          <div>
            <p className="doc-clean-label">Date</p>
            <p>{formatDateShort(payload.issuedDate)}</p>
          </div>
          <div>
            <p className="doc-clean-label">{dueLabel}</p>
            <p>{isInvoice ? formatDateShort(payload.deadlineDate) : formatDateShort(payload.issuedDate)}</p>
          </div>
        </div>
      </section>

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

      <footer className="doc-clean-foot">
        <div className="doc-clean-sign-wrap">
          {payload.brand.signatureUrl ? (
            <img className="doc-clean-signature" src={payload.brand.signatureUrl} alt="Business signature" />
          ) : (
            <div className="doc-clean-signature-line" />
          )}
          <p className="doc-clean-sign-label">Authorized Signature</p>
        </div>
        {socialHandles.length ? (
          <div className="doc-clean-social-row">
            {socialHandles.map((item) => {
              const platform = item.platform.toLowerCase()
              const Icon = platform === 'instagram' ? FaInstagram : platform === 'facebook' ? FaFacebookF : FaTiktok
              const color = platform === 'instagram' ? '#E1306C' : platform === 'facebook' ? '#1877F2' : '#000000'
              return (
                <p key={item.id} className="doc-clean-social-item">
                  <Icon size={11} style={{ color }} />
                  <span>{item.handle}</span>
                </p>
              )
            })}
          </div>
        ) : null}
        <p>Thanks for your patronage.</p>
      </footer>
    </div>
  )
}
