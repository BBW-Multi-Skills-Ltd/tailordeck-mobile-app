import { formatNaira } from '../../../lib/utils'
import type { DocumentTemplateLineItem, DocumentTemplatePayload } from '../../types'
import { styles } from './invoiceClassicWaveStyles'

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

function numberToSimpleWords(amount: number): string {
  if (!amount) return 'Zero'
  const rounded = Math.round(amount)
  return rounded.toLocaleString('en-NG')
}
