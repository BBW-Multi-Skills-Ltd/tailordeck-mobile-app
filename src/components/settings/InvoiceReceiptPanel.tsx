import { CheckSquare, FileText, Image as ImageIcon, Upload } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { brandColorOptions, documentTemplate } from './settingsOptions'
import type { TailorSettings } from '../../lib/settings'

type BrandDetailKey = keyof TailorSettings['brand']['includeBusinessDetails']

type InvoiceReceiptPanelProps = {
  settings: TailorSettings
  openColorPicker: 0 | 1 | null
  invoicePreviewGenerated: boolean
  saved: boolean
  onColorPickerToggle: (index: 0 | 1) => void
  onColorChange: (index: 0 | 1, value: string) => void
  onFileUpload: (field: 'logoUrl' | 'signatureUrl', event: ChangeEvent<HTMLInputElement>) => void
  onToggleBrandDetail: (key: BrandDetailKey) => void
  onGeneratePreview: () => void
  onSave: () => void
}

export default function InvoiceReceiptPanel({
  settings,
  openColorPicker,
  invoicePreviewGenerated,
  saved,
  onColorPickerToggle,
  onColorChange,
  onFileUpload,
  onToggleBrandDetail,
  onGeneratePreview,
  onSave,
}: InvoiceReceiptPanelProps) {
  return (
    <div className="stack settings-brand-form">
      <article className="settings-panel-guide">
        <strong>Set this once, reuse everywhere</strong>
        <p>Pick document colors, upload logo/signature, choose business details, then generate a preview before saving.</p>
      </article>

      <div className="stack settings-brand-group">
        <p className="settings-brand-label">Document Template</p>
        <p className="settings-help-text">One clean template is used for both invoice and receipt.</p>
        <div className="settings-brand-template-grid">
          <div className="settings-brand-template-card active">
            <div className="settings-brand-template-preview">
              <div className="settings-brand-template-top" style={{ backgroundColor: settings.brand.colors[0] }} />
              <div className="settings-brand-template-line" />
              <div className="settings-brand-template-line short" />
            </div>
            <p className="settings-brand-template-title">{documentTemplate.title}</p>
            <p className="settings-brand-template-sub">{documentTemplate.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="stack settings-brand-group">
        <p className="settings-brand-label">Select Your Brand Colors</p>
        <p className="settings-help-text">Choose a Header Color and Body Color. TailorDeck auto-mixes both for clean document sections.</p>
        <div className="settings-brand-color-pickers">
          {([
            { label: 'Header', index: 0 as const },
            { label: 'Body', index: 1 as const },
          ]).map((color) => (
            <div key={color.label} className="settings-brand-color-picker-item">
              <div className="row-between">
                <p className="settings-brand-color-title">{color.label}</p>
                <p className="settings-brand-color-hex">{settings.brand.colors[color.index].toUpperCase()}</p>
              </div>
              <button type="button" className="settings-choice-pill settings-brand-color-pick-btn" onClick={() => onColorPickerToggle(color.index)}>
                Pick {color.label} Color
              </button>

              {openColorPicker === color.index ? (
                <div className="settings-brand-color-palette">
                  {brandColorOptions.map((hex) => (
                    <button key={`${color.label}-${hex}`} type="button" className={`settings-brand-palette-chip${settings.brand.colors[color.index].toLowerCase() === hex.toLowerCase() ? ' active' : ''}`} onClick={() => onColorChange(color.index, hex)}>
                      <span className="settings-brand-palette-dot" style={{ backgroundColor: hex }} />
                      <span>{hex.toUpperCase()}</span>
                    </button>
                  ))}
                  <label className="settings-brand-custom-color">
                    <span>Custom Color</span>
                    <input type="color" value={settings.brand.colors[color.index]} onChange={(event) => onColorChange(color.index, event.target.value)} />
                  </label>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="stack settings-brand-group">
        <p className="settings-brand-label">Business Logo</p>
        <p className="settings-help-text">Use PNG/JPG, max 2MB, square or horizontal logo works best.</p>
        <label className="settings-brand-upload-box">
          <div className="settings-brand-upload-preview">
            {settings.brand.logoUrl ? <img src={settings.brand.logoUrl} alt="Logo preview" /> : <ImageIcon size={18} />}
          </div>
          <div className="stack gap-4">
            <span>Upload Logo</span>
          </div>
          <input type="file" accept="image/*" className="settings-brand-upload-input" onChange={(event) => onFileUpload('logoUrl', event)} />
        </label>
      </div>

      <div className="stack settings-brand-group">
        <p className="settings-brand-label">
          Business Signature <span className="settings-brand-signature-note">(image of your signature)</span>
        </p>
        <p className="settings-help-text">Use transparent PNG or clean JPG, max 2MB.</p>
        <label className="settings-brand-upload-box">
          <div className="settings-brand-upload-preview">
            {settings.brand.signatureUrl ? <img src={settings.brand.signatureUrl} alt="Signature preview" /> : <Upload size={18} />}
          </div>
          <div className="stack gap-4">
            <span>Upload Signature</span>
          </div>
          <input type="file" accept="image/*" className="settings-brand-upload-input" onChange={(event) => onFileUpload('signatureUrl', event)} />
        </label>
      </div>

      <div className="stack settings-brand-group">
        <p className="settings-brand-label">Business Details To Show</p>
        <p className="settings-help-text">Choose which business information appears on invoice and receipt.</p>
        <div className="settings-radio-list">
          {([
            { key: 'phone', label: 'Business Phone' },
            { key: 'email', label: 'Business Email' },
            { key: 'website', label: 'Business Website' },
            { key: 'social', label: 'Social Handles' },
            { key: 'address', label: 'Shop Address' },
          ] as const).map((item) => (
            <button key={item.key} type="button" className={`settings-radio-option${settings.brand.includeBusinessDetails[item.key] ? ' active' : ''}`} onClick={() => onToggleBrandDetail(item.key)}>
              <span className="settings-radio-indicator" />
              <CheckSquare size={15} className="settings-radio-icon" />
              <span className="settings-radio-title">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stack settings-brand-group">
        <div className="settings-brand-final-preview">
          <button type="button" className="btn btn-primary settings-brand-generate-btn settings-brand-generate-btn-in-wrap" onClick={onGeneratePreview}>
            <FileText size={16} />
            {invoicePreviewGenerated ? 'Open Preview' : 'Generate Preview'}
          </button>
        </div>
        {saved ? <p className="text-sm text-success">Invoice & Receipt Setup saved.</p> : null}
      </div>

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Invoice & Receipt Setup
      </button>
    </div>
  )
}
