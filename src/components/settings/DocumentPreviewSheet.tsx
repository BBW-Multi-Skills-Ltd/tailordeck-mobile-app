import { X } from 'lucide-react'
import { renderTemplate } from '../../lib/docTemplates'
import type { TailorSettings } from '../../lib/settings'
import { buildSettingsTemplatePreviewPayload } from './settingsPreviewPayload'

type DocumentPreviewSheetProps = {
  settings: TailorSettings
  previewKind: 'invoice' | 'receipt'
  onPreviewKindChange: (kind: 'invoice' | 'receipt') => void
  onClose: () => void
  onEdit: () => void
  onSave: () => void
}

export default function DocumentPreviewSheet({ settings, previewKind, onPreviewKindChange, onClose, onEdit, onSave }: DocumentPreviewSheetProps) {
  return (
    <div className="side-sheet-overlay" role="dialog" aria-modal="true" aria-label="Invoice and receipt template preview" onClick={onClose}>
      <aside className="side-sheet" onClick={(event) => event.stopPropagation()}>
        <header className="side-sheet-header">
          <h3 className="side-sheet-title">Template Preview</h3>
          <button type="button" className="btn btn-ghost btn-icon side-sheet-close" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>
        </header>

        <div className="side-sheet-body">
          <div className="settings-brand-generated-paper">
            {renderTemplate(buildSettingsTemplatePreviewPayload(settings, previewKind))}
          </div>
          <div className="row gap-8 settings-brand-mode-switch">
            <button type="button" className={`btn btn-secondary flex-1${previewKind === 'invoice' ? ' active' : ''}`} onClick={() => onPreviewKindChange('invoice')}>
              View as Invoice
            </button>
            <button type="button" className={`btn btn-secondary flex-1${previewKind === 'receipt' ? ' active' : ''}`} onClick={() => onPreviewKindChange('receipt')}>
              View as Receipt
            </button>
          </div>
          <button type="button" className="btn btn-secondary settings-brand-edit-btn" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="btn btn-primary settings-brand-template-save-btn" onClick={onSave}>
            Save Template Design
          </button>
        </div>
      </aside>
    </div>
  )
}
