import { formatDateShort } from '../../../lib/utils'
import type { DocumentTemplatePayload } from '../../types'
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
  const shopName = payload.brand.shopName || 'Business Name Here'

  return (
    <div style={styles.brandBlock}>
      <div style={styles.logoBox(primary)}>
        {payload.brand.logoUrl ? (
          <img src={payload.brand.logoUrl} alt={`${shopName} logo`} style={styles.logoImage} />
        ) : (
          <span style={styles.logoText}>YOUR LOGO</span>
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
}: {
  accent: string
  details: ReturnType<typeof getClassicWaveBusinessDetails>
  docTitle: string
}) {
  const contacts = [
    details.details.phone ? `Phone: ${details.businessPhone}` : '',
    details.details.email ? `Email: ${details.businessEmail}` : '',
    details.details.cac && details.cacRegistrationNumber ? `RC ${details.cacRegistrationNumber}` : '',
    details.details.website ? `Web: ${details.website}` : '',
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
      <p style={styles.companyName}>{payload.brand.shopName || 'Business Name Here'}</p>
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
