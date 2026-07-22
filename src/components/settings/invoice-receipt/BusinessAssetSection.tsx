import type { ChangeEvent, ReactNode } from 'react'
import { Image as ImageIcon, Upload } from 'lucide-react'
import type { TailorSettings } from '../../../lib/settings'
import { SectionHeader } from './InvoiceSetupProgress'

export function BusinessAssetSection({
  onFileUpload,
  settings,
}: {
  settings: TailorSettings
  onFileUpload: (field: 'logoUrl' | 'signatureUrl', event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <section className="settings-document-section">
      <SectionHeader title="Business Assets" helper="Add your logo and signature for cleaner documents." />
      <div className="settings-document-upload-grid">
        <UploadBox
          label="Business Logo"
          helper="PNG or JPG, max 2MB."
          preview={settings.brand.logoUrl ? <img src={settings.brand.logoUrl} alt="Logo preview" /> : <ImageIcon size={18} />}
          onChange={(event) => onFileUpload('logoUrl', event)}
        />
        <UploadBox
          label="Business Signature"
          helper="Transparent PNG works best."
          preview={settings.brand.signatureUrl ? <img src={settings.brand.signatureUrl} alt="Signature preview" /> : <Upload size={18} />}
          onChange={(event) => onFileUpload('signatureUrl', event)}
        />
      </div>
    </section>
  )
}

function UploadBox({
  helper,
  label,
  onChange,
  preview,
}: {
  helper: string
  label: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  preview: ReactNode
}) {
  return (
    <label className="settings-brand-upload-box settings-document-upload-box">
      <div className="settings-brand-upload-preview">{preview}</div>
      <div className="stack gap-4">
        <span>{label}</span>
        <small>{helper}</small>
      </div>
      <input type="file" accept="image/*" className="settings-brand-upload-input" onChange={onChange} />
    </label>
  )
}
