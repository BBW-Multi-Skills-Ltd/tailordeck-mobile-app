import type { DocumentTemplatePayload } from '../types'
import { getClassicWaveBusinessDetails, getClassicWaveLabels, getClassicWaveLineItems } from './invoiceClassicWaveUtils'
import {
  BrandBlock,
  CompanyBlock,
  DecorativeStrip,
  InvoiceBody,
  MetaBar,
  ReceiptBody,
  SignatureSection,
  TitleBlock,
} from './classicWave/InvoiceClassicWaveParts'
import { styles } from './classicWave/invoiceClassicWaveStyles'

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
        <TitleBlock accent={accent} details={details} docTitle={docTitle} payload={payload} />
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
        {isInvoice ? <InvoiceBody accent={accent} lines={lines} payload={payload} /> : <ReceiptBody accent={accent} payload={payload} />}
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
