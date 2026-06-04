import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6'
import type { DocumentTemplatePayload } from '../types'
import { getClassicWaveBusinessDetails } from './invoiceClassicWaveUtils'

type InvoiceClassicFooterProps = {
  payload: DocumentTemplatePayload
}

export function InvoiceClassicFooter({ payload }: InvoiceClassicFooterProps) {
  const { socialHandles } = getClassicWaveBusinessDetails(payload)

  return (
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
  )
}
