import { ArrowLeft } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobClientCard } from '../components/jobdetail/JobClientCard'
import { JobDeadlineSection } from '../components/jobdetail/JobDeadlineSection'
import { JobImageViewer } from '../components/jobdetail/JobImageViewer'
import { JobInfoSection } from '../components/jobdetail/JobInfoSection'
import { JobPricingSection } from '../components/jobdetail/JobPricingSection'
import { JobReferencePhotos } from '../components/jobdetail/JobReferencePhotos'
import {
  getDefaultJobDetails,
  getMeasurementScopeText,
} from '../components/jobdetail/jobDetailUtils'
import { useJobDocumentActions } from '../components/jobdetail/useJobDocumentActions'
import { useJobImageViewer } from '../components/jobdetail/useJobImageViewer'
import { readBrandConfig } from '../components/invoice/documentHelpers'
import type { BrandConfig, InvoiceType } from '../components/invoice/documentTypes'
import { appJobMeasurementById, appJobs } from '../data/appData'
import { detailedMockByJobId, type DetailedJobData } from '../data/mockJobDetails'
import type { MockJob } from '../types/job'

const JobDocumentDrawer = lazy(() =>
  import('../components/jobdetail/JobDocumentDrawer').then((module) => ({ default: module.JobDocumentDrawer })),
)

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const job = id ? appJobs.find((item) => item.id === id) : undefined
  const brand = useMemo(() => readBrandConfig(), [])

  const details = useMemo<DetailedJobData>(() => {
    if (!job) return getDefaultJobDetails()
    return detailedMockByJobId[job.id] ?? getDefaultJobDetails(job)
  }, [job])

  if (!job) {
    return (
      <section className="section stack gap-16">
        <h2 className="app-page-heading">Job Not Found</h2>
        <p className="text-muted">This job may have been removed.</p>
        <Link to="/jobs" className="btn btn-secondary">
          Back to Jobs
        </Link>
      </section>
    )
  }

  return <JobDetailContent job={job} brand={brand} details={details} />
}

function JobDetailContent({
  job,
  brand,
  details,
}: {
  job: MockJob
  brand: BrandConfig
  details: DetailedJobData
}) {
  const [openDrawer, setOpenDrawer] = useState<InvoiceType | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  useJobImageViewer({
    viewerIndex,
    photoCount: details.referencePhotos.length,
    setViewerIndex,
  })

  const totalExpenses = details.expenses.reduce((sum, expense) => sum + expense.cost, 0)
  const balanceToCollect = Math.max(job.chargeAmount - details.depositAmount, 0)
  const estimatedProfit = job.chargeAmount - totalExpenses
  const measurementSnapshot = appJobMeasurementById[job.id]
  const measurementScopeText = getMeasurementScopeText({
    details,
    measurementOrderScope: measurementSnapshot?.orderScope,
    fallbackScope: job.jobType,
  })
  const activePhoto = viewerIndex === null ? null : details.referencePhotos[viewerIndex]

  const {
    docPreviewRef,
    handleDownload,
    handleSystemShare,
    handleWhatsAppToClient,
  } = useJobDocumentActions({
    brand,
    job,
    details,
    balanceToCollect,
  })

  function showPreviousPhoto(): void {
    setViewerIndex((prev) => (prev === null ? 0 : (prev - 1 + details.referencePhotos.length) % details.referencePhotos.length))
  }

  function showNextPhoto(): void {
    setViewerIndex((prev) => (prev === null ? 0 : (prev + 1) % details.referencePhotos.length))
  }

  return (
    <>
      <section className="section stack gap-16">
        <header className="row-between">
          <Link to="/jobs" className="btn btn-ghost btn-icon" aria-label="Back to jobs">
            <ArrowLeft size={18} />
          </Link>
          <h2 className="app-page-heading">Job Details</h2>
          <span style={{ width: '44px' }} />
        </header>

        <JobClientCard job={job} />
        <JobInfoSection job={job} details={details} measurementScopeText={measurementScopeText} />
        <JobPricingSection
          chargeAmount={job.chargeAmount}
          depositAmount={details.depositAmount}
          balanceToCollect={balanceToCollect}
          totalExpenses={totalExpenses}
          estimatedProfit={estimatedProfit}
          expenses={details.expenses}
        />
        <JobReferencePhotos photos={details.referencePhotos} onOpen={setViewerIndex} />
        <JobDeadlineSection deadlineDate={job.deadlineDate} deliveryTime={details.deliveryTime} reminder={details.reminder} />

        <div className="row gap-8">
          <button type="button" className="btn btn-primary flex-1" onClick={() => setOpenDrawer('invoice')}>
            Send Invoice
          </button>
          <button type="button" className="btn btn-secondary flex-1" onClick={() => setOpenDrawer('receipt')}>
            Send Receipt
          </button>
        </div>
      </section>

      {activePhoto ? (
        <JobImageViewer
          activePhoto={activePhoto}
          currentIndex={viewerIndex ?? 0}
          total={details.referencePhotos.length}
          onClose={() => setViewerIndex(null)}
          onPrevious={showPreviousPhoto}
          onNext={showNextPhoto}
        />
      ) : null}

      {openDrawer ? (
        <Suspense fallback={null}>
          <JobDocumentDrawer
            type={openDrawer}
            brand={brand}
            job={job}
            details={details}
            balanceToCollect={balanceToCollect}
            docPreviewRef={docPreviewRef}
            onClose={() => setOpenDrawer(null)}
            onShare={(type) => void handleSystemShare(type)}
            onWhatsApp={(type) => void handleWhatsAppToClient(type)}
            onDownload={(type) => void handleDownload(type)}
          />
        </Suspense>
      ) : null}
    </>
  )
}
