import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { renderTemplate } from '../../lib/docTemplates'
import { buildSettingsTemplatePreviewPayload } from './settingsPreviewPayload'
import { BusinessAssetSection } from './invoice-receipt/BusinessAssetSection'
import { BusinessDetailsSection } from './invoice-receipt/BusinessDetailsSection'
import { FullDocumentPreviewModal, LiveDocumentPreviewSection } from './invoice-receipt/DocumentPreviewSection'
import { buildInvoiceSetupChecklist, getAvailableBusinessDetails } from './invoice-receipt/invoiceReceiptConfig'
import { InvoiceSetupProgress } from './invoice-receipt/InvoiceSetupProgress'
import type { BrandDetailKey, InvoiceReceiptPanelProps } from './invoice-receipt/invoiceReceiptTypes'

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
      <BusinessAssetSection settings={settings} onFileUpload={onFileUpload} />
      <BusinessDetailsSection
        availableBusinessDetails={availableBusinessDetails}
        onDetailClick={handleBusinessDetailClick}
        settings={settings}
        setupNotice={setupNotice}
      />
      <LiveDocumentPreviewSection invoicePreview={invoicePreview} receiptPreview={receiptPreview} onOpen={setOpenPreview} />

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
