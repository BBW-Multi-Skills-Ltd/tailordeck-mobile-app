import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JobDocumentDrawer } from '../jobdetail/JobDocumentDrawer'
import { useJobDocumentActions } from '../jobdetail/useJobDocumentActions'
import { useAppFeedback } from '../shared/appFeedbackCore'
import { JobSuccessActions } from './success/JobSuccessActions'
import { JobSuccessSummaryCard } from './success/JobSuccessSummaryCard'
import type { JobSuccessViewProps } from './success/jobSuccessTypes'
import { useJobSuccessDocumentData } from './success/useJobSuccessDocumentData'
import { useFeatureAccess } from '../../hooks/useFeatureAccess'
import { featureKeys } from '../../lib/features'

export function JobSuccessView(props: JobSuccessViewProps) {
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const navigate = useNavigate()
  const feedback = useAppFeedback()
  const documentSendingAccess = useFeatureAccess(featureKeys.documentSending)
  const invoiceLocked = documentSendingAccess.data === false
  const { balanceToCollect, brand, successDetails, successJob } = useJobSuccessDocumentData(props)
  const { docPreviewRef, handleDownload, handleSystemShare, handleWhatsAppToClient } = useJobDocumentActions({
    brand,
    job: successJob,
    details: successDetails,
    balanceToCollect,
  })

  async function handleOpenInvoice(): Promise<void> {
    if (documentSendingAccess.isLoading) {
      feedback.toast('Checking your plan...', 'info')
      return
    }

    if (invoiceLocked) {
      const confirmed = await feedback.confirm({
        title: 'Upgrade to send invoices',
        message: 'Sending PDF invoices to clients is available on Pro.',
        confirmLabel: 'View Plans',
        cancelLabel: 'Not now',
      })
      if (confirmed) navigate('/settings/subscription')
      return
    }

    setInvoiceOpen(true)
  }

  return (
    <section className="section stack gap-16 wizard-page wizard-success-page">
      <div className="stack gap-16 wizard-success-screen">
        <div className="wizard-success-icon-wrap">
          <CheckCircle2 size={58} className="wizard-success-icon" />
        </div>
        <p className="wizard-success-kicker">JOB CONFIRMED</p>
        <h2 className="wizard-success-title">Contract Created!</h2>
        <p className="text-sm text-muted wizard-success-sub">You now have a contract with</p>
        <p className="wizard-success-client">{props.clientName || 'Client'}</p>

        <JobSuccessSummaryCard charge={props.charge} deadlineDate={props.deadlineDate} jobType={props.jobType} />
        <JobSuccessActions
          invoiceLocked={invoiceLocked}
          onOpenInvoice={() => void handleOpenInvoice()}
          onReturnHome={() => navigate('/')}
          onViewJobDetails={props.onViewJobDetails}
        />
      </div>

      {invoiceOpen ? (
        <JobDocumentDrawer
          type="invoice"
          brand={brand}
          job={successJob}
          details={successDetails}
          balanceToCollect={balanceToCollect}
          docPreviewRef={docPreviewRef}
          onClose={() => setInvoiceOpen(false)}
          onShare={(type) => void handleSystemShare(type)}
          onWhatsApp={(type) => void handleWhatsAppToClient(type)}
          onDownload={(type) => void handleDownload(type)}
        />
      ) : null}
    </section>
  )
}
