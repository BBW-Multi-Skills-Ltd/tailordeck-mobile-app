import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Eye,
  Globe2,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Share2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { ChangeEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FitDocumentPreview } from '../invoice/FitDocumentPreview'
import { renderTemplate } from '../../lib/docTemplates'
import type { TailorSettings } from '../../lib/settings'
import { buildSettingsTemplatePreviewPayload } from './settingsPreviewPayload'

type BrandDetailKey = keyof TailorSettings['brand']['includeBusinessDetails']

const DOCUMENT_WIDTH = 1120
const DOCUMENT_HEIGHT = 792

type InvoiceReceiptPanelProps = {
  settings: TailorSettings
  saved: boolean
  onFileUpload: (field: 'logoUrl' | 'signatureUrl', event: ChangeEvent<HTMLInputElement>) => void
  onToggleBrandDetail: (key: BrandDetailKey) => void
  onSave: () => void
}

const detailOptions: Array<{ key: BrandDetailKey; label: string; icon: LucideIcon }> = [
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'website', label: 'Website', icon: Globe2 },
  { key: 'social', label: 'Social', icon: Share2 },
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'cac', label: 'CAC / RC', icon: BadgeCheck },
]

export default function InvoiceReceiptPanel({
  settings,
  saved,
  onFileUpload,
  onToggleBrandDetail,
  onSave,
}: InvoiceReceiptPanelProps) {
  const navigate = useNavigate()
  const [openPreview, setOpenPreview] = useState<'invoice' | 'receipt' | null>(null)
  const [setupNotice, setSetupNotice] = useState('')
  const redirectTimerRef = useRef<number | null>(null)
  const checklist = buildInvoiceSetupChecklist(settings)
  const completeCount = checklist.filter((item) => item.complete).length
  const progress = Math.round((completeCount / checklist.length) * 100)
  const invoicePreview = useMemo(() => renderTemplate(buildSettingsTemplatePreviewPayload(settings, 'invoice')), [settings])
  const receiptPreview = useMemo(() => renderTemplate(buildSettingsTemplatePreviewPayload(settings, 'receipt')), [settings])
  const activePreview = openPreview === 'invoice' ? invoicePreview : receiptPreview
  const availableBusinessDetails = getAvailableBusinessDetails(settings)

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  function handleBusinessDetailClick(item: { key: BrandDetailKey; label: string }): void {
    if (availableBusinessDetails[item.key]) {
      onToggleBrandDetail(item.key)
      return
    }

    setSetupNotice(`Add your business ${item.label.toLowerCase()} first.`)
    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current)
    }
    redirectTimerRef.current = window.setTimeout(() => navigate('/business'), 650)
  }

  return (
    <div className="stack settings-brand-form">
      <InvoiceSetupProgress completeCount={completeCount} items={checklist} progress={progress} />

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

      <section className="settings-document-section">
        <SectionHeader title="Business Details" helper="Choose what appears on invoice and receipt." />
        <div className="settings-business-detail-chips">
          {detailOptions.map((item) => {
            const Icon = item.icon
            const available = availableBusinessDetails[item.key]
            const active = available && settings.brand.includeBusinessDetails[item.key]
            return (
            <button
              key={item.key}
              type="button"
              className={`settings-business-detail-chip${active ? ' active' : ''}${available ? '' : ' missing'}`}
              onClick={() => handleBusinessDetailClick(item)}
            >
              <span className="settings-radio-indicator" />
              <Icon size={15} className="settings-radio-icon" />
              <span>{item.label}</span>
              {!available ? <small>Set up first</small> : null}
            </button>
            )
          })}
        </div>
        {setupNotice ? <p className="settings-detail-setup-notice">{setupNotice}</p> : null}
        <p className="settings-horizontal-scroll-hint">
          Swipe for more <ArrowRight size={13} />
        </p>
      </section>

      <section className="settings-document-section">
        <SectionHeader title="Live Document Preview" helper="Swipe to view invoice or receipt." />
        <div className="settings-document-preview-strip" aria-label="Invoice and receipt live previews">
          <DocumentPreviewCard label="Invoice" onOpen={() => setOpenPreview('invoice')}>{invoicePreview}</DocumentPreviewCard>
          <DocumentPreviewCard label="Receipt" onOpen={() => setOpenPreview('receipt')}>{receiptPreview}</DocumentPreviewCard>
        </div>
      </section>

      {saved ? <p className="text-sm text-success">Invoice & Receipt Setup saved.</p> : null}

      <button type="button" className="btn btn-primary settings-panel-save-btn" onClick={onSave}>
        Save Invoice & Receipt Setup
      </button>

      {openPreview ? (
        <FullDocumentPreviewModal label={openPreview === 'invoice' ? 'Invoice' : 'Receipt'} onClose={() => setOpenPreview(null)}>
          {activePreview}
        </FullDocumentPreviewModal>
      ) : null}
    </div>
  )
}

function buildInvoiceSetupChecklist(settings: TailorSettings) {
  return [
    { label: 'Logo', complete: Boolean(settings.brand.logoUrl) },
    { label: 'Signature', complete: Boolean(settings.brand.signatureUrl) },
    { label: 'CAC / RC number', complete: Boolean(settings.businessInfo.cacRegistrationNumber.trim()) },
    { label: 'Business phone', complete: Boolean(settings.businessInfo.businessPhone.replace(/\D/g, '').length > 3) },
    { label: 'Business email', complete: Boolean(settings.businessInfo.businessEmail.trim()) },
    { label: 'Business website', complete: Boolean(settings.businessInfo.website.replace(/^https?:\/\//, '').trim()) },
    { label: 'Shop address', complete: Boolean(settings.businessInfo.shopAddress.trim()) },
    { label: 'Social handle', complete: settings.businessInfo.socialHandles.length > 0 },
  ]
}

function getAvailableBusinessDetails(settings: TailorSettings): Record<BrandDetailKey, boolean> {
  return {
    address: Boolean(settings.businessInfo.shopAddress.trim()),
    cac: Boolean(settings.businessInfo.cacRegistrationNumber.trim()),
    email: Boolean(settings.businessInfo.businessEmail.trim()),
    phone: Boolean(settings.businessInfo.businessPhone.replace(/\D/g, '').length > 3),
    social: settings.businessInfo.socialHandles.length > 0,
    website: Boolean(settings.businessInfo.website.replace(/^https?:\/\//, '').trim()),
  }
}

function InvoiceSetupProgress({
  completeCount,
  items,
  progress,
}: {
  completeCount: number
  items: Array<{ label: string; complete: boolean }>
  progress: number
}) {
  return (
    <section className="settings-document-progress">
      <div className="row-between">
        <div>
          <p className="settings-document-progress-kicker">Invoice setup</p>
          <h3>{progress}% complete</h3>
        </div>
        <span className="settings-document-progress-count">
          {completeCount}/{items.length}
        </span>
      </div>
      <div className="settings-document-progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="settings-document-checklist">
        {items.map((item) => (
          <span key={item.label} className={`settings-document-check${item.complete ? ' complete' : ''}`}>
            {item.complete ? <CheckCircle2 size={13} /> : <Circle size={13} />}
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}

function SectionHeader({ helper, title }: { helper: string; title: string }) {
  return (
    <div className="stack gap-4">
      <p className="settings-brand-label">{title}</p>
      <p className="settings-help-text">{helper}</p>
    </div>
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

function DocumentPreviewCard({ children, label, onOpen }: { children: ReactNode; label: string; onOpen: () => void }) {
  return (
    <article className="settings-document-preview-card">
      <div className="row-between settings-document-preview-card-head">
        <p>{label}</p>
        <button type="button" className="settings-document-open-btn" onClick={onOpen}>
          <Eye size={13} />
          Open
        </button>
      </div>
      <div className="settings-document-preview-paper">
        <FitDocumentPreview>{children}</FitDocumentPreview>
      </div>
    </article>
  )
}

function FullDocumentPreviewModal({
  children,
  label,
  onClose,
}: {
  children: ReactNode
  label: string
  onClose: () => void
}) {
  const [zoom, setZoom] = useState(1)

  return (
    <div className="document-preview-modal-overlay" role="dialog" aria-modal="true" aria-label={`${label} full preview`} onClick={onClose}>
      <div className="document-preview-modal" onClick={(event) => event.stopPropagation()}>
        <header className="document-preview-modal-head">
          <p>{label} Preview</p>
          <div className="document-preview-modal-actions">
            <button type="button" className="document-preview-zoom-btn" onClick={() => setZoom((value) => Math.max(0.75, value - 0.15))}>
              -
            </button>
            <button type="button" className="document-preview-zoom-value" onClick={() => setZoom(1)}>
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" className="document-preview-zoom-btn" onClick={() => setZoom((value) => Math.min(1.8, value + 0.15))}>
              +
            </button>
            <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close preview">
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="document-preview-modal-body">
          <ZoomableDocumentPreview zoom={zoom}>{children}</ZoomableDocumentPreview>
        </div>
      </div>
    </div>
  )
}

function ZoomableDocumentPreview({ children, zoom }: { children: ReactNode; zoom: number }) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const scale = baseScale * zoom

  useEffect(() => {
    const node = shellRef.current
    if (!node) return

    const updateScale = () => {
      const availableWidth = node.clientWidth
      if (!availableWidth) return
      setBaseScale(Math.min(1, availableWidth / DOCUMENT_WIDTH))
    }

    updateScale()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale)
      return () => window.removeEventListener('resize', updateScale)
    }

    const observer = new ResizeObserver(updateScale)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={shellRef} className="document-preview-zoom-shell">
      <div
        className="document-preview-zoom-space"
        style={{
          height: Math.ceil(DOCUMENT_HEIGHT * scale),
          width: Math.ceil(DOCUMENT_WIDTH * scale),
        }}
      >
        <div
          className="document-fit-stage"
          style={{
            height: DOCUMENT_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: DOCUMENT_WIDTH,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
