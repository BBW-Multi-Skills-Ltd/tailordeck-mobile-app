import type { CSSProperties, ReactNode } from 'react'
import { formatDateShort, formatNaira } from '../../lib/utils'
import type { DocumentTemplateLineItem, DocumentTemplatePayload } from '../types'
import { getClassicWaveBusinessDetails, getClassicWaveLabels, getClassicWaveLineItems } from './invoiceClassicWaveUtils'

const PAGE_WIDTH = 1120
const PAGE_HEIGHT = 792

export function InvoiceClassicWaveTemplate(payload: DocumentTemplatePayload) {
  const { docIdLabel, docTitle, dueLabel, isInvoice } = getClassicWaveLabels(payload.kind)
  const primary = payload.brand.primaryColor || '#7B1E37'
  const secondary = payload.brand.secondaryColor || '#FAF8F5'
  const accent = payload.brand.accentColor || '#C9A84C'
  const lines = getClassicWaveLineItems(payload)
  const details = getClassicWaveBusinessDetails(payload)
  const social = details.socialHandles.map((item) => `${item.platform}: ${item.handle}`).join('  |  ')

  return (
    <article className="doc-landscape-root" style={styles.page(primary, secondary)}>
      <DecorativeStrip primary={primary} accent={accent} />
      <header style={styles.header}>
        <BrandBlock payload={payload} primary={primary} accent={accent} />
        <TitleBlock
          accent={accent}
          details={details}
          docTitle={docTitle}
          payload={payload}
        />
        <CompanyBlock details={details} payload={payload} />
      </header>
      <div style={styles.headerRule(primary)} />
      <MetaBar
        date={payload.issuedDate}
        docIdLabel={docIdLabel}
        dueDate={isInvoice ? payload.deadlineDate : payload.issuedDate}
        dueLabel={dueLabel}
        id={payload.documentId}
        primary={primary}
      />
      <main style={styles.body}>
        {isInvoice ? (
          <InvoiceBody accent={accent} lines={lines} payload={payload} />
        ) : (
          <ReceiptBody accent={accent} payload={payload} />
        )}
      </main>
      <SignatureSection isInvoice={isInvoice} payload={payload} primary={primary} />
      <footer style={styles.footer(primary)}>
        <span>Thank you for your patronage.</span>
        <span>{social || 'Computer-generated document from TailorDeck'}</span>
      </footer>
      <DecorativeStrip primary={primary} accent={accent} reverse />
    </article>
  )
}

function DecorativeStrip({ accent, primary, reverse = false }: { accent: string; primary: string; reverse?: boolean }) {
  return (
    <div style={styles.stripWrap(reverse)}>
      <span style={styles.stripSegment(primary, reverse ? 'polygon(0 0, 96% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 96% 100%, 0 100%)')} />
      <span style={styles.stripSegment(accent, reverse ? 'polygon(0 0, 100% 0, 100% 100%, 4% 100%)' : 'polygon(4% 0, 100% 0, 100% 100%, 0 100%)')} />
    </div>
  )
}

function BrandBlock({ accent, payload, primary }: { accent: string; payload: DocumentTemplatePayload; primary: string }) {
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

function TitleBlock({
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

function CompanyBlock({ details, payload }: { details: ReturnType<typeof getClassicWaveBusinessDetails>; payload: DocumentTemplatePayload }) {
  return (
    <div style={styles.companyBlock}>
      <p style={styles.companyName}>{payload.brand.shopName || 'TailorDeck Shop'}</p>
      {details.details.address ? <p style={styles.companyAddress}>{details.businessAddress}</p> : null}
    </div>
  )
}

function MetaBar({
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

function InvoiceBody({ accent, lines, payload }: { accent: string; lines: DocumentTemplateLineItem[]; payload: DocumentTemplatePayload }) {
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

function ReceiptBody({ accent, payload }: { accent: string; payload: DocumentTemplatePayload }) {
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

function SignatureSection({ isInvoice, payload, primary }: { isInvoice: boolean; payload: DocumentTemplatePayload; primary: string }) {
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

const styles = {
  page: (primary: string, secondary: string): CSSProperties => ({
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    background: secondary || '#FAF8F5',
    color: '#24121A',
    border: '1px solid rgba(36,18,26,0.18)',
    borderRadius: 18,
    overflow: 'hidden',
    fontFamily: 'Inter, Arial, sans-serif',
    boxShadow: '0 22px 45px rgba(36, 18, 26, 0.14)',
    display: 'flex',
    flexDirection: 'column',
    ['--doc-primary' as string]: primary,
  }),
  stripWrap: (reverse: boolean): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    height: 18,
    transform: reverse ? 'rotate(180deg)' : undefined,
  }),
  stripSegment: (color: string, clipPath: string): CSSProperties => ({ background: color, clipPath }),
  header: {
    display: 'grid',
    gridTemplateColumns: '210px 1fr 240px',
    alignItems: 'center',
    gap: 24,
    padding: '24px 46px 18px',
  } satisfies CSSProperties,
  brandBlock: { display: 'flex', flexDirection: 'column', gap: 6 } satisfies CSSProperties,
  logoBox: (primary: string): CSSProperties => ({
    width: 58,
    height: 58,
    borderRadius: 14,
    background: primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.08em',
  }),
  logoImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 } satisfies CSSProperties,
  logoText: { color: '#fff' } satisfies CSSProperties,
  logoTagline: (accent: string): CSSProperties => ({ margin: 0, fontSize: 8, color: accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }),
  titleBlock: { textAlign: 'center', minWidth: 0 } satisfies CSSProperties,
  docTitle: { margin: 0, fontSize: 22, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 900 } satisfies CSSProperties,
  contactPills: { marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '4px 7px' } satisfies CSSProperties,
  contactItem: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#24121A', fontWeight: 800, whiteSpace: 'nowrap' } satisfies CSSProperties,
  dot: (accent: string): CSSProperties => ({ width: 4, height: 4, borderRadius: 999, background: accent, display: 'inline-block' }),
  companyBlock: { textAlign: 'right' } satisfies CSSProperties,
  companyName: { margin: 0, fontSize: 14, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em' } satisfies CSSProperties,
  companyAddress: { margin: '6px 0 0', fontSize: 12, lineHeight: 1.45, color: '#24121A', fontWeight: 750 } satisfies CSSProperties,
  headerRule: (primary: string): CSSProperties => ({ height: 2, background: primary, opacity: 0.85, margin: '0 46px' }),
  metaBar: (primary: string): CSSProperties => ({
    margin: '14px 46px 0',
    padding: '10px 16px',
    borderRadius: 12,
    background: `${primary}14`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  metaPair: { margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#190A10', textTransform: 'uppercase', letterSpacing: '0.06em' } satisfies CSSProperties,
  body: { flex: '0 0 auto', padding: '14px 46px 4px' } satisfies CSSProperties,
  invoiceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } satisfies CSSProperties,
  receiptGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } satisfies CSSProperties,
  field: { border: '1px solid rgba(36,18,26,0.12)', background: 'rgba(255,255,255,0.42)', borderRadius: 12, padding: '10px 12px' } satisfies CSSProperties,
  underlineField: {
    display: 'grid',
    gridTemplateColumns: '190px 1fr',
    alignItems: 'center',
    gap: 18,
    borderBottom: '1px solid rgba(36,18,26,0.13)',
    padding: '9px 0',
  } satisfies CSSProperties,
  fieldWide: { gridColumn: '1 / -1' } satisfies CSSProperties,
  fieldLabel: { display: 'block', marginBottom: 5, fontSize: 10.5, fontWeight: 950, color: '#24121A', textTransform: 'uppercase', letterSpacing: '0.08em' } satisfies CSSProperties,
  fieldValue: { display: 'block', fontSize: 15, lineHeight: 1.35, color: '#0E0508', fontWeight: 900 } satisfies CSSProperties,
  tableWrap: { gridColumn: '1 / -1', border: '1px solid rgba(36,18,26,0.13)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.5)' } satisfies CSSProperties,
  tableHead: (accent: string): CSSProperties => ({ display: 'grid', gridTemplateColumns: '1fr 80px 130px 130px', gap: 0, background: accent, color: '#0E0508', fontSize: 10.5, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 14px' }),
  tableRow: { display: 'grid', gridTemplateColumns: '1fr 80px 130px 130px', padding: '9px 14px', borderTop: '1px solid rgba(36,18,26,0.16)', fontSize: 13, color: '#0E0508', fontWeight: 800, alignItems: 'center' } satisfies CSSProperties,
  tableEmptyRow: { display: 'grid', gridTemplateColumns: '1fr 80px 130px 130px', minHeight: 30, borderTop: '1px solid rgba(36,18,26,0.08)', alignItems: 'center' } satisfies CSSProperties,
  totalsBox: (accent: string): CSSProperties => ({ gridColumn: '1 / -1', justifySelf: 'end', width: 330, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(36,18,26,0.12)', background: `${accent}18` }),
  totalLine: (strong: boolean): CSSProperties => ({ display: 'flex', justifyContent: 'space-between', padding: strong ? '10px 13px' : '8px 13px', fontSize: strong ? 11 : 9, fontWeight: strong ? 900 : 700, color: strong ? '#7B1E37' : '#342129', borderTop: strong ? '1px solid rgba(36,18,26,0.12)' : undefined }),
  receiptTotalsGrid: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginTop: 10 } satisfies CSSProperties,
  receiptTotalBox: (index: number, accent: string): CSSProperties => {
    const colors = [
      { border: '#315B7C', color: '#18344C', bg: 'rgba(49,91,124,0.05)' },
      { border: '#329A66', color: '#278457', bg: 'rgba(50,154,102,0.08)' },
      { border: '#B33A4E', color: '#9B1E37', bg: 'rgba(179,58,78,0.08)' },
    ][index] ?? { border: accent, color: '#24121A', bg: 'rgba(255,255,255,0.4)' }

    return {
      border: `2px solid ${colors.border}`,
      borderRadius: 6,
      background: colors.bg,
      color: colors.color,
      minHeight: 42,
      padding: '6px 10px',
      textAlign: 'center',
    }
  },
  receiptTotalLabel: { display: 'block', marginBottom: 5, fontSize: 10.5, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' } satisfies CSSProperties,
  receiptTotalValue: { display: 'block', fontSize: 20, fontWeight: 950, lineHeight: 1.05 } satisfies CSSProperties,
  signatureSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 82, marginTop: 42, padding: '0 84px 10px', alignItems: 'end' } satisfies CSSProperties,
  invoiceSignatureSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 82, marginTop: 46, padding: '0 84px 12px', alignItems: 'end' } satisfies CSSProperties,
  signatureBlock: { textAlign: 'center' } satisfies CSSProperties,
  signatureSpace: { height: 48, display: 'flex', alignItems: 'end', justifyContent: 'center' } satisfies CSSProperties,
  signatureImage: { maxWidth: 130, maxHeight: 38, objectFit: 'contain' } satisfies CSSProperties,
  signatureLine: (primary: string): CSSProperties => ({ height: 1.5, background: primary, opacity: 0.9 }),
  signatureLabel: { margin: '6px 0 0', fontSize: 10, color: '#190A10', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' } satisfies CSSProperties,
  footer: (primary: string): CSSProperties => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 46px', background: `${primary}12`, fontSize: 8, fontStyle: 'italic', color: '#6F5C64' }),
} satisfies Record<string, CSSProperties | ((...args: never[]) => CSSProperties)>

function renderNode(children: ReactNode) {
  return children
}

void renderNode
