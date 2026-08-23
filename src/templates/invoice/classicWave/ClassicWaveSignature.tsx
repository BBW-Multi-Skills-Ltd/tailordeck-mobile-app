import type { DocumentTemplatePayload } from '../../types'
import { styles } from './invoiceClassicWaveStyles'

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
      <div style={styles.signatureSpace}>{image ? <img src={image} alt={label} style={styles.signatureImage} decoding="async" /> : null}</div>
      <div style={styles.signatureLine(primary)} />
      <p style={styles.signatureLabel}>{label}</p>
    </div>
  )
}
