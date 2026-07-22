import { ArrowLeft } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobClientCard } from '../components/jobdetail/JobClientCard'
import { JobDeadlineSection } from '../components/jobdetail/JobDeadlineSection'
import { JobDocumentActions } from '../components/jobdetail/JobDocumentActions'
import { JobImageViewer } from '../components/jobdetail/JobImageViewer'
import { JobInfoSection } from '../components/jobdetail/JobInfoSection'
import { JobPricingSection } from '../components/jobdetail/JobPricingSection'
import { JobReferencePhotos } from '../components/jobdetail/JobReferencePhotos'
import { getMeasurementScopeText } from '../components/jobdetail/jobDetailUtils'
import { useJobDetailData } from '../components/jobdetail/page/useJobDetailData'
import { useJobDetailInteractions } from '../components/jobdetail/page/useJobDetailInteractions'
import PageHeader from '../components/shared/PageHeader'
import type { DetailedJobData } from '../data/mockJobDetails'
import type { MockJob } from '../types/job'
import type { BrandConfig } from '../components/invoice/documentTypes'

const JobDocumentDrawer = lazy(() =>
  import('../components/jobdetail/JobDocumentDrawer').then((module) => ({ default: module.JobDocumentDrawer })),
)

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const { brand, details, job, jobQuery, jobRow } = useJobDetailData(id)

  if (jobQuery.isLoading) return <JobDetailLoading />
  if (!job) return <JobDetailNotFound />

  return <JobDetailContent job={job} brand={brand} details={details} measurementOrderScope={jobRow?.order_scope} />
}

function JobDetailLoading() {
  return (
    <section className="section stack gap-16">
      <div className="skeleton" style={{ height: 42 }} />
      <div className="skeleton" style={{ height: 96 }} />
      <div className="skeleton" style={{ height: 220 }} />
    </section>
  )
}

function JobDetailNotFound() {
  return (
    <section className="section stack gap-16">
      <h2 className="app-page-heading">Job Not Found</h2>
      <p className="text-muted">This job may have been removed or is unavailable.</p>
      <Link to="/jobs" className="btn btn-secondary">Back to Jobs</Link>
    </section>
  )
}

function JobDetailContent({
  job,
  brand,
  details,
  measurementOrderScope,
}: {
  job: MockJob
  brand: BrandConfig
  details: DetailedJobData
  measurementOrderScope?: string
}) {
  const totalExpenses = details.expenses.reduce((sum, expense) => sum + expense.cost, 0)
  const balanceToCollect = Math.max(job.chargeAmount - details.depositAmount, 0)
  const estimatedProfit = job.chargeAmount - totalExpenses
  const measurementScopeText = getMeasurementScopeText({ details, measurementOrderScope, fallbackScope: job.jobType })
  const interactions = useJobDetailInteractions({ balanceToCollect, brand, details, job })
  const { docPreviewRef, handleDownload, handleSystemShare, handleWhatsAppToClient } = interactions.documentActions

  return (
    <>
      <section className="section stack gap-16">
        <PageHeader
          title="Job Details"
          centered
          leading={<Link to="/jobs" className="btn btn-ghost btn-icon" aria-label="Back to jobs"><ArrowLeft size={18} /></Link>}
        />
        <JobClientCard job={job} />
        <JobInfoSection job={job} details={details} measurementScopeText={measurementScopeText} />
        <JobPricingSection chargeAmount={job.chargeAmount} depositAmount={details.depositAmount} balanceToCollect={balanceToCollect} totalExpenses={totalExpenses} estimatedProfit={estimatedProfit} expenses={details.expenses} />
        <JobReferencePhotos photos={details.referencePhotos} onOpen={interactions.setViewerIndex} />
        <JobDeadlineSection deadlineDate={job.deadlineDate} deliveryTime={details.deliveryTime} reminder={details.reminder} />
        <JobDocumentActions invoiceSent={interactions.sentDocuments.invoice} onInvoice={() => interactions.setOpenDrawer('invoice')} onReceipt={() => interactions.setOpenDrawer('receipt')} receiptSent={interactions.sentDocuments.receipt} />
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
            onDownload={(type) => void handleDownload(type)}
          />
        </Suspense>
      ) : null}
    </>
  )
}
