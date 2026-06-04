import { Globe, Mail, MapPin, PhoneCall } from 'lucide-react'
import type { ReactNode } from 'react'
import type { DocumentTemplatePayload } from '../types'
import { formatDateShort } from '../../lib/utils'
import { getClassicWaveBusinessDetails } from './invoiceClassicWaveUtils'

type InvoiceClassicMetaProps = {
  dueLabel: string
  isInvoice: boolean
  payload: DocumentTemplatePayload
}

export function InvoiceClassicMeta({ dueLabel, isInvoice, payload }: InvoiceClassicMetaProps) {
  const { businessAddress, businessEmail, businessPhone, details, website } = getClassicWaveBusinessDetails(payload)

  return (
    <section className="doc-clean-meta">
      <div className="doc-clean-block">
        <p className="doc-clean-label">{isInvoice ? 'Invoice To' : 'Receipt For'}</p>
        <p className="doc-clean-strong">{payload.clientName || 'Client Name'}</p>
        <p>{payload.clientPhone || '+234 000 000 0000'}</p>
      </div>

      <div className="doc-clean-block">
        <p className="doc-clean-label">Contact</p>
        {details.address ? <ContactLine icon={<MapPin size={12} />} label="Address" value={businessAddress} /> : null}
        {details.phone ? <ContactLine icon={<PhoneCall size={12} />} label="Call" value={businessPhone} /> : null}
        {details.email ? <ContactLine icon={<Mail size={12} />} label="Email us at" value={businessEmail} /> : null}
        {details.website ? <ContactLine icon={<Globe size={12} />} label="Visit our website" value={website} /> : null}
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
  )
}

function ContactLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <p className="doc-clean-contact-line">
      {icon}
      <span>{label}: {value}</span>
    </p>
  )
}
