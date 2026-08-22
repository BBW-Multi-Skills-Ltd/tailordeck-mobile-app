import { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BrandConfig, InvoiceType } from '../../invoice/documentTypes'
import HistoryBackButton from '../../shared/HistoryBackButton'
import PageHeader from '../../shared/PageHeader'
import { useAppFeedback } from '../../shared/appFeedbackCore'
import { useDocumentsQuery } from '../../../hooks/useDocumentQueries'
import { useFeatureAccess } from '../../../hooks/useFeatureAccess'
import { useUpdateJobStatusMutation } from '../../../hooks/useJobQueries'
import { featureKeys } from '../../../lib/features'
import { getServiceErrorMessage } from '../../../services/serviceHelpers'
import type { MockJob } from '../../../types/job'
import type { DetailedJobData } from '../../../types/jobDetails'
import { JobClientCard } from '../JobClientCard'
import { JobCompletionSection } from '../JobCompletionSection'
import { JobDeadlineSection } from '../JobDeadlineSection'
import { JobDocumentActions } from '../JobDocumentActions'
import { JobDraftActions } from '../JobDraftActions'
import { JobImageViewer } from '../JobImageViewer'
import { JobInfoSection } from '../JobInfoSection'
import { JobPricingSection } from '../JobPricingSection'
import { JobReferencePhotos } from '../JobReferencePhotos'
import { getMeasurementScopeText } from '../jobDetailUtils'
import { useJobDetailInteractions } from './useJobDetailInteractions'

const JobDocumentDrawer = lazy(() =>
  import('../JobDocumentDrawer').then((module) => ({ default: module.JobDocumentDrawer })),
)

type JobDetailContentProps = {
  brand: BrandConfig
  completedAt?: string | null
  details: DetailedJobData
  job: MockJob
  measurementOrderScope?: string
}

export function JobDetailContent({ brand, completedAt, details, job, measurementOrderScope }: JobDetailContentProps) {
  const totalExpenses = details.expenses.reduce((sum, expense) => sum + expense.cost, 0)
  const balanceToCollect = Math.max(job.chargeAmount - details.depositAmount, 0)
  const estimatedProfit = job.chargeAmount - totalExpenses
  const measurementScopeText = getMeasurementScopeText({ details, measurementOrderScope, fallbackScope: job.jobType })
  const interactions = useJobDetailInteractions({ balanceToCollect, brand, details, job })
  const { docPreviewRef, handleSystemShare, handleWhatsAppToClient } = interactions.documentActions
  const navigate = useNavigate()
  const feedback = useAppFeedback()
  const documentSendingAccess = useFeatureAccess(featureKeys.documentSending)
  const [statusError, setStatusError] = useState('')
  const documentsQuery = useDocumentsQuery(job.id)
  const updateStatusMutation = useUpdateJobStatusMutation()
  const documentsLocked = documentSendingAccess.data === false
  const persistedSentDocuments = {
    invoice: documentsQuery.data?.some((document) => document.type === 'invoice' && Boolean(document.sent_at)) ?? false,
    receipt: documentsQuery.data?.some((document) => document.type === 'receipt' && Boolean(document.sent_at)) ?? false,
  }

  async function openDocument(type: InvoiceType): Promise<void> {
    if (documentSendingAccess.isLoading) return

    if (documentsLocked) {
      const confirmed = await feedback.confirm({
        title: 'Upgrade to send documents',
        message: 'PDF invoice and receipt sending is available on Pro.',
        confirmLabel: 'View Plans',
        cancelLabel: 'Not now',
      })
      if (confirmed) navigate('/settings/subscription')
      return
    }

    interactions.setOpenDrawer(type)
  }

  async function completeJob(): Promise<void> {
    const confirmed = await feedback.confirm({
      title: 'Mark job completed?',
      message: 'This will move the job to Completed and update your dashboard.',
      confirmLabel: 'Mark Completed',
      cancelLabel: 'Not yet',
    })
    if (!confirmed) return

    try {
      setStatusError('')
      await updateStatusMutation.mutateAsync({ id: job.id, status: 'Completed' })
    } catch (error) {
      setStatusError(getServiceErrorMessage(error, 'Unable to update this job. Please try again.'))
    }
  }

  return (
    <>
      <section className="section stack gap-16">
        <PageHeader title="Job Details" centered leading={<HistoryBackButton fallbackTo="/jobs" />} />
        <JobClientCard job={job} />
        {job.status === 'Draft' ? <JobDraftActions onResume={() => navigate(`/jobs/new?draftId=${job.id}`)} /> : null}
        <JobInfoSection job={job} details={details} measurementScopeText={measurementScopeText} />
        <JobPricingSection chargeAmount={job.chargeAmount} depositAmount={details.depositAmount} balanceToCollect={balanceToCollect} totalExpenses={totalExpenses} estimatedProfit={estimatedProfit} expenses={details.expenses} />
        <JobReferencePhotos photos={details.referencePhotos} onOpen={interactions.setViewerIndex} />
        <JobDeadlineSection deadlineDate={job.deadlineDate} deliveryTime={details.deliveryTime} reminder={details.reminder} />
        {job.status === 'Draft' ? null : (
          <>
            <JobCompletionSection completedAt={completedAt} errorMessage={statusError} isUpdating={updateStatusMutation.isPending} status={job.status} onComplete={() => void completeJob()} />
            <JobDocumentActions
              invoiceSent={persistedSentDocuments.invoice || interactions.sentDocuments.invoice}
              locked={documentsLocked}
              receiptSent={persistedSentDocuments.receipt || interactions.sentDocuments.receipt}
              onInvoice={() => void openDocument('invoice')}
              onReceipt={() => void openDocument('receipt')}
            />
          </>
        )}
      </section>

      {interactions.activePhoto ? (
        <JobImageViewer activePhoto={interactions.activePhoto} currentIndex={interactions.viewerIndex ?? 0} total={details.referencePhotos.length} onClose={() => interactions.setViewerIndex(null)} onPrevious={interactions.showPreviousPhoto} onNext={interactions.showNextPhoto} />
      ) : null}

      {interactions.openDrawer ? (
        <Suspense fallback={null}>
          <JobDocumentDrawer
            type={interactions.openDrawer}
            brand={brand}
            job={job}
            details={details}
            balanceToCollect={balanceToCollect}
            docPreviewRef={docPreviewRef}
            onClose={() => interactions.setOpenDrawer(null)}
            onShare={(type) => void interactions.handleSharedDocument(type, handleSystemShare)}
            onWhatsApp={(type) => void interactions.handleSharedDocument(type, handleWhatsAppToClient)}
          />
        </Suspense>
      ) : null}
    </>
  )
}
