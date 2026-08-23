import { formatNaira } from '../../../lib/utils'
import type { DocumentTemplateLineItem, DocumentTemplatePayload } from '../../types'
import { styles } from './invoiceClassicWaveStyles'

export function InvoiceBody({ accent, lines, payload }: { accent: string; lines: DocumentTemplateLineItem[]; payload: DocumentTemplatePayload }) {
  const primaryLine = lines[0]
  const description = primaryLine?.details || primaryLine?.description || payload.service || ''
  const isSettingsPreview = payload.previewMode === 'settings'

  return (
    <div style={styles.invoiceGrid}>
      <InvoiceInfoFields isSettingsPreview={isSettingsPreview} payload={payload} />
      <InvoiceDescriptionBlock description={getPreviewText(description, 'Job description here', isSettingsPreview)} />
      <InvoicePaymentSummary accent={accent} isSettingsPreview={isSettingsPreview} payload={payload} />
    </div>
  )
}

export function ReceiptBody({ accent, payload }: { accent: string; payload: DocumentTemplatePayload }) {
  const isSettingsPreview = payload.previewMode === 'settings'
  const amountInWords = isSettingsPreview && !payload.deposit
    ? 'Amount in words here'
    : `${numberToNairaWords(payload.deposit)} only`

  return (
    <div style={styles.receiptGrid}>
      <Field label="Received With Thanks From" value={getPreviewText(payload.clientName, 'Client name here', isSettingsPreview)} underline />
      <Field label="The Sum Of" value={formatMoneyOrText(getPreviewMoney(payload.deposit, 'Amount paid here', isSettingsPreview))} underline />
      <Field label="Amount In Words" value={amountInWords} underline wide />
      <Field label="Being Payment For" value={getPreviewText(payload.service, 'Payment purpose here', isSettingsPreview)} underline wide />
      <TotalsGrid
        accent={accent}
        layout="horizontal"
        rows={[
          ['Total Amount', getPreviewMoney(payload.charge, 'Total amount here', isSettingsPreview)],
          ['Amount Paid', getPreviewMoney(payload.deposit, 'Amount paid here', isSettingsPreview)],
          ['Balance', getPreviewMoney(payload.balance, 'Balance here', isSettingsPreview)],
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
      <strong style={styles.fieldValue}>{value || '-'}</strong>
    </div>
  )
}

function InvoiceInfoFields({ isSettingsPreview, payload }: { isSettingsPreview: boolean; payload: DocumentTemplatePayload }) {
  return (
    <>
      <Field label="Invoice To" value={getPreviewText(payload.clientName, 'Client name here', isSettingsPreview)} />
      <Field label="Service" value={getPreviewText(payload.service, 'Service name here', isSettingsPreview)} />
    </>
  )
}

function InvoiceDescriptionBlock({ description }: { description: string }) {
  return (
    <div style={styles.invoiceDescriptionBlock}>
      <span style={styles.fieldLabel}>Description</span>
      <strong style={styles.invoiceDescriptionValue}>{description || '-'}</strong>
    </div>
  )
}

function InvoicePaymentSummary({ accent, isSettingsPreview, payload }: { accent: string; isSettingsPreview: boolean; payload: DocumentTemplatePayload }) {
  return (
    <TotalsGrid
      accent={accent}
      layout="horizontal"
      rows={[
        ['Total Charge', getPreviewMoney(payload.charge, 'Total charge here', isSettingsPreview)],
        ['Deposit To Be Made', getPreviewMoney(payload.deposit, 'Deposit here', isSettingsPreview)],
        ['Balance After Job', getPreviewMoney(payload.balance, 'Balance here', isSettingsPreview)],
      ]}
    />
  )
}

function TotalsGrid({
  accent,
  layout,
  rows,
}: {
  accent: string
  layout: 'horizontal' | 'vertical'
  rows: Array<[string, number | string]>
}) {
  if (layout === 'horizontal') {
    return (
      <div style={styles.receiptTotalsGrid}>
        {rows.map(([label, value], index) => (
          <div key={label} style={styles.receiptTotalBox(index, accent)}>
            <span style={styles.receiptTotalLabel}>{label}</span>
            <strong style={{ ...styles.receiptTotalValue, ...(typeof value === 'string' ? styles.receiptTotalPlaceholderValue : {}) }}>
              {formatMoneyOrText(value)}
            </strong>
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
          <strong>{formatMoneyOrText(value)}</strong>
        </div>
      ))}
    </div>
  )
}

function getPreviewText(value: string, placeholder: string, isSettingsPreview: boolean): string {
  if (value) return value
  return isSettingsPreview ? placeholder : ''
}

function getPreviewMoney(value: number, placeholder: string, isSettingsPreview: boolean): number | string {
  if (value) return value
  return isSettingsPreview ? placeholder : value
}

function formatMoneyOrText(value: number | string): string {
  return typeof value === 'number' ? formatNaira(value) : value
}

function numberToNairaWords(amount: number): string {
  const rounded = Math.max(0, Math.round(amount))
  if (!rounded) return 'Zero naira'
  return `${numberToWords(rounded)} naira`
}

function numberToWords(value: number): string {
  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  function underThousand(input: number): string {
    const parts: string[] = []
    const hundred = Math.floor(input / 100)
    const remainder = input % 100
    if (hundred) parts.push(`${units[hundred]} hundred`)
    if (remainder >= 20) {
      const ten = Math.floor(remainder / 10)
      const unit = remainder % 10
      parts.push(unit ? `${tens[ten]} ${units[unit]}` : tens[ten])
    } else if (remainder >= 10) {
      parts.push(teens[remainder - 10])
    } else if (remainder > 0) {
      parts.push(units[remainder])
    }
    return parts.join(' and ')
  }

  const groups: Array<[number, string]> = [
    [1_000_000_000, 'billion'],
    [1_000_000, 'million'],
    [1_000, 'thousand'],
  ]
  const parts: string[] = []
  let remainder = value

  groups.forEach(([size, label]) => {
    const count = Math.floor(remainder / size)
    if (!count) return
    parts.push(`${underThousand(count)} ${label}`)
    remainder %= size
  })

  if (remainder) parts.push(underThousand(remainder))
  return parts.join(', ').replace(/\b\w/g, (char) => char.toUpperCase())
}
