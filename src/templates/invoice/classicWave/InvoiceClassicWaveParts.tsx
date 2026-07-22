import { formatDateShort, formatNaira } from '../../../lib/utils'
import type { DocumentTemplateLineItem, DocumentTemplatePayload } from '../../types'
import { getClassicWaveBusinessDetails } from '../invoiceClassicWaveUtils'
import { styles } from './invoiceClassicWaveStyles'

export function DecorativeStrip({ accent, primary, reverse = false }: { accent: string; primary: string; reverse?: boolean }) {
  return (
    <div style={styles.stripWrap(reverse)}>
      <span style={styles.stripSegment(primary, reverse ? 'polygon(0 0, 96% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 96% 100%, 0 100%)')} />
      <span style={styles.stripSegment(accent, reverse ? 'polygon(0 0, 100% 0, 100% 100%, 4% 100%)' : 'polygon(4% 0, 100% 0, 100% 100%, 0 100%)')} />
    </div>
  )
}

export function BrandBlock({ accent, payload, primary }: { accent: string; payload: DocumentTemplatePayload; primary: string }) {
  const shopName = payload.brand.shopName || 'TailorDeck Shop'

  return (
    <div style={styles.brandBlock}>
      <div style={styles.logoBox(primary)}>
        {payload.brand.logoUrl ? (
          <img src={payload.brand.logoUrl} alt={`${shopName} logo`} style={styles.logoImage} />
        ) : (
          <span style={styles.logoText}>LOGO</span>
        )}
      </div>
      <p style={styles.logoTagline(accent)}>Professional tailoring</p>
    </div>
  )
}

export function TitleBlock({
  accent,
  details,
  docTitle,
  payload,
}: {
  accent: string
  details: ReturnType<typeof getClassicWaveBusinessDetails>
  docTitle: string
  payload: DocumentTemplatePayload
}) {
  const contacts = [
    details.details.phone ? details.businessPhone : '',
    payload.clientPhone ? `WhatsApp ${payload.clientPhone}` : '',
    details.details.email ? details.businessEmail : '',
    details.details.cac && details.cacRegistrationNumber ? `RC ${details.cacRegistrationNumber}` : '',
    details.details.website ? details.website : '',
  ].filter(Boolean)

  return (
    <div style={styles.titleBlock}>
      <h2 style={styles.docTitle}>{docTitle}</h2>
      <div style={styles.contactPills}>
        {contacts.map((item, index) => (
          <span key={item} style={styles.contactItem}>
            {index > 0 ? <span style={styles.dot(accent)} /> : null}
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CompanyBlock({ details, payload }: { details: ReturnType<typeof getClassicWaveBusinessDetails>; payload: DocumentTemplatePayload }) {
  return (
    <div style={styles.companyBlock}>
      <p style={styles.companyName}>{payload.brand.shopName || 'TailorDeck Shop'}</p>
      {details.details.address ? <p style={styles.companyAddress}>{details.businessAddress}</p> : null}
    </div>
  )
}

export function MetaBar({
  date,
  docIdLabel,
  dueDate,
  dueLabel,
  id,
  primary,
}: {
  date: string
  docIdLabel: string
  dueDate: string
  dueLabel: string
  id: string
  primary: string
}) {
  return (
    <section style={styles.metaBar(primary)}>
      <MetaPair label={docIdLabel} value={id} />
      <MetaPair label="Date" value={formatDateShort(date)} />
      <MetaPair label={dueLabel} value={formatDateShort(dueDate)} />
    </section>
  )
}

function MetaPair({ label, value }: { label: string; value: string }) {
  return (
    <p style={styles.metaPair}>
      <span>{label}</span>
      <strong>{value}</strong>
    </p>
  )
}

export function InvoiceBody({ accent, lines, payload }: { accent: string; lines: DocumentTemplateLineItem[]; payload: DocumentTemplatePayload }) {
  const visibleLines = lines.slice(0, 5)
  const emptyRows = Array.from({ length: Math.max(3 - visibleLines.length, 0) })

  return (
    <div style={styles.invoiceGrid}>
      <Field label="Invoice To" value={payload.clientName || 'Client Name'} />
      <Field label="Service" value={payload.service || 'Tailoring service'} />
      <div style={styles.tableWrap}>
        <div style={styles.tableHead(accent)}>
          <span>Description</span>
          <span>Qty</span>
          <span>Unit</span>
          <span>Total</span>
        </div>
        {visibleLines.map((item, index) => (
          <div key={`${item.description}-${index}`} style={styles.tableRow}>
            <span>
              <strong>{item.description}</strong>
              {item.details ? <small>{item.details}</small> : null}
            </span>
            <span>{item.qty}</span>
            <span>{formatNaira(item.unitPrice)}</span>
            <span>{formatNaira(item.total)}</span>
          </div>
        ))}
        {emptyRows.map((_, index) => (
          <div key={`empty-row-${index}`} style={styles.tableEmptyRow}>
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
      <TotalsGrid
        accent={accent}
        layout="horizontal"
        rows={[
          ['Total Charge', payload.charge],
          ['Deposit To Be Made', payload.deposit],
          ['Balance After Job', payload.balance],
        ]}
      />
    </div>
  )
}

export function ReceiptBody({ accent, payload }: { accent: string; payload: DocumentTemplatePayload }) {
  return (
    <div style={styles.receiptGrid}>
      <Field label="Received With Thanks From" value={payload.clientName || 'Client Name'} underline />
      <Field label="The Sum Of" value={formatNaira(payload.deposit)} underline />
      <Field label="Amount In Words" value={`${numberToSimpleWords(payload.deposit)} naira only`} underline wide />
      <Field label="Being Payment For" value={payload.service || 'Tailoring service'} underline wide />
      <TotalsGrid
        accent={accent}
        layout="horizontal"
        rows={[
          ['Total Amount', payload.charge],
          ['Amount Paid', payload.deposit],
          ['Balance', payload.balance],
        ]}
      />
    </div>
  )
}

function Field({
  label,
  underline = false,
  value,
  wide = false,
}: {
  label: string
  underline?: boolean
  value: string
  wide?: boolean
}) {
  return (
    <div style={{ ...(underline ? styles.underlineField : styles.field), ...(wide ? styles.fieldWide : {}) }}>
      <span style={styles.fieldLabel}>{label}</span>
      <strong style={styles.fieldValue}>{value}</strong>
    </div>
  )
}

function TotalsGrid({
  accent,
  layout,
  rows,
}: {
  accent: string
  layout: 'horizontal' | 'vertical'
  rows: Array<[string, number]>
}) {
  if (layout === 'horizontal') {
    return (
      <div style={styles.receiptTotalsGrid}>
        {rows.map(([label, value], index) => (
          <div key={label} style={styles.receiptTotalBox(index, accent)}>
            <span style={styles.receiptTotalLabel}>{label}</span>
            <strong style={styles.receiptTotalValue}>{formatNaira(value)}</strong>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={styles.totalsBox(accent)}>
      {rows.map(([label, value], index) => (
        <div key={label} style={styles.totalLine(index === rows.length - 1)}>
          <span>{label}</span>
          <strong>{formatNaira(value)}</strong>
        </div>
      ))}
    </div>
  )
}

export function SignatureSection({ isInvoice, payload, primary }: { isInvoice: boolean; payload: DocumentTemplatePayload; primary: string }) {
  return (
    <section style={isInvoice ? styles.invoiceSignatureSection : styles.signatureSection}>
      {isInvoice ? <div /> : <SignatureBlock label="Client Signature" />}
      <SignatureBlock image={payload.brand.signatureUrl} label="Authorized Signature" primary={primary} />
    </section>
  )
}

function SignatureBlock({ image, label, primary = '#7B1E37' }: { image?: string; label: string; primary?: string }) {
  return (
    <div style={styles.signatureBlock}>
      <div style={styles.signatureSpace}>{image ? <img src={image} alt={label} style={styles.signatureImage} /> : null}</div>
      <div style={styles.signatureLine(primary)} />
      <p style={styles.signatureLabel}>{label}</p>
    </div>
  )
}

function numberToSimpleWords(amount: number): string {
  if (!amount) return 'Zero'
  const rounded = Math.round(amount)
  return rounded.toLocaleString('en-NG')
}
