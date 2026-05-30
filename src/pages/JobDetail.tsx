import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  HandCoins,
  Layers2,
  List,
  Palette,
  Package,
  Phone,
  Receipt,
  Ruler,
  Share2,
  ShieldCheck,
  Tag,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { appJobMeasurementById, appJobs } from '../data/appData'
import { detailedMockByJobId, type DetailedJobData } from '../data/mockJobDetails'
import { formatNaira, getInitial } from '../lib/utils'
import type { JobStatus } from '../types/job'
import {
  DocumentPreview,
  buildDocumentShareText,
  buildWhatsAppURL,
  readBrandConfig,
  type InvoiceType,
} from '../components/invoice/DocumentPreview'

function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

function formatDateNumeric(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB')
}

function formatDateWords(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTimeWords(value: string): string {
  if (!value) return '-'
  const [hourRaw, minuteRaw] = value.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value

  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const [openDrawer, setOpenDrawer] = useState<InvoiceType | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const docPreviewRef = useRef<HTMLDivElement | null>(null)

  const job = id ? appJobs.find((item) => item.id === id) : undefined
  const brand = useMemo(() => readBrandConfig(), [])

  const details = useMemo<DetailedJobData>(() => {
    if (!job) {
      return {
        jobType: 'Body Wear',
        orderMode: 'New Stitch',
        itemType: '-',
        orderScope: '-',
        measurement: '-',
        materialType: '-',
        color: '-',
        totalYard: '-',
        materialQuality: '-',
        materialSource: '-',
        deliveryTime: '-',
        reminder: '-',
        referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
        expenses: [],
        depositAmount: 0,
      }
    }

    return (
      detailedMockByJobId[job.id] ?? {
        itemType: job.title,
        orderMode: 'New Stitch',
        jobType: 'Body Wear',
        orderScope: job.jobType,
        measurement: `${job.jobType} measurements captured`,
        materialType: 'Ankara',
        color: 'Mixed',
        totalYard: '0',
        materialQuality: 'Normal',
        materialSource: 'Client Provided',
        deliveryTime: '12:00',
        reminder: '1 day before',
        referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
        expenses: [],
        depositAmount: 0,
      }
    )
  }, [job])

  const totalExpenses = details.expenses.reduce((sum, expense) => sum + expense.cost, 0)
  const balanceToCollect = job ? Math.max(job.chargeAmount - details.depositAmount, 0) : 0
  const estimatedProfit = job ? job.chargeAmount - totalExpenses : 0

  useEffect(() => {
    if (viewerIndex === null) return

    function handleKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setViewerIndex(null)
        return
      }

      if (!details.referencePhotos.length) return

      if (event.key === 'ArrowRight') {
        setViewerIndex((prev) => (prev === null ? 0 : (prev + 1) % details.referencePhotos.length))
      }

      if (event.key === 'ArrowLeft') {
        setViewerIndex((prev) => (prev === null ? 0 : (prev - 1 + details.referencePhotos.length) % details.referencePhotos.length))
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [viewerIndex, details.referencePhotos])

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

  const currentJob = job
  const measurementSnapshot = appJobMeasurementById[currentJob.id]
  const measurementScopeText =
    details.jobType === 'Non-Body Item'
      ? 'Non-body item captured'
      : measurementSnapshot?.orderScope ?? currentJob.jobType
  const activePhoto = viewerIndex === null ? null : details.referencePhotos[viewerIndex]

  async function buildPdfBlob(): Promise<Blob | null> {
    if (!docPreviewRef.current) return null

    const canvas = await html2canvas(docPreviewRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('.job-doc-ui-title').forEach((node) => node.remove())
      },
    })

    const imageData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width
    pdf.addImage(imageData, 'PNG', 0, 0, width, height)
    return pdf.output('blob')
  }

  function triggerPdfDownload(blob: Blob, type: InvoiceType): void {
    const fileName = `${brand.shopName.replace(/\s+/g, '-').toLowerCase()}-${type}-${currentJob.id}.pdf`
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = fileName
    link.click()
    URL.revokeObjectURL(objectUrl)
  }

  async function handleSystemShare(type: InvoiceType): Promise<void> {
    const text = buildDocumentShareText({
      type,
      shopName: brand.shopName,
      clientName: currentJob.clientName,
      clientPhone: currentJob.clientPhone,
      service: details.itemType,
      charge: currentJob.chargeAmount,
      deposit: details.depositAmount,
      balance: balanceToCollect,
      deadlineDate: currentJob.deadlineDate,
    })

    const blob = await buildPdfBlob()
    if (!blob) return

    const fileName = `${brand.shopName.replace(/\s+/g, '-').toLowerCase()}-${type}-${currentJob.id}.pdf`
    const pdfFile = new File([blob], fileName, { type: 'application/pdf' })

    if (navigator.share) {
      try {
        if ('canShare' in navigator && typeof navigator.canShare === 'function' && !navigator.canShare({ files: [pdfFile] })) {
          throw new Error('File share unsupported')
        }

        await navigator.share({
          title: `${brand.shopName} ${type === 'invoice' ? 'Invoice' : 'Receipt'}`,
          text,
          files: [pdfFile],
        })
        return
      } catch {
        triggerPdfDownload(blob, type)
        return
      }
    }

    triggerPdfDownload(blob, type)
  }

  async function handleWhatsAppToClient(type: InvoiceType): Promise<void> {
    const text = buildDocumentShareText({
      type,
      shopName: brand.shopName,
      clientName: currentJob.clientName,
      clientPhone: currentJob.clientPhone,
      service: details.itemType,
      charge: currentJob.chargeAmount,
      deposit: details.depositAmount,
      balance: balanceToCollect,
      deadlineDate: currentJob.deadlineDate,
    })

    const blob = await buildPdfBlob()
    if (blob) {
      if (navigator.share) {
        try {
          const fileName = `${brand.shopName.replace(/\s+/g, '-').toLowerCase()}-${type}-${currentJob.id}.pdf`
          const pdfFile = new File([blob], fileName, { type: 'application/pdf' })

          if ('canShare' in navigator && typeof navigator.canShare === 'function' && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
              title: `${brand.shopName} ${type === 'invoice' ? 'Invoice' : 'Receipt'}`,
              text: `For ${currentJob.clientName} (${currentJob.clientPhone})`,
              files: [pdfFile],
            })
          } else {
            triggerPdfDownload(blob, type)
          }
        } catch {
          triggerPdfDownload(blob, type)
        }
      } else {
        triggerPdfDownload(blob, type)
      }
    }

    const url = buildWhatsAppURL(currentJob.clientPhone, text)
    window.open(url, '_blank', 'noopener,noreferrer')
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

        <article className="card stack gap-12">
          <div className="row-between">
            <div className="row gap-12">
              <div className="client-avatar">{getInitial(currentJob.clientName)}</div>
              <div className="stack gap-4">
                <h3>{currentJob.clientName}</h3>
                <p className="text-sm text-muted row gap-4">
                  <Phone size={14} />
                  {currentJob.clientPhone}
                </p>
              </div>
            </div>
            <span className={statusClass(currentJob.status)}>{currentJob.status}</span>
          </div>
        </article>

        <article className="card stack gap-10">
          <h4>Job Information</h4>
          <div className="stack gap-8">
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Layers2 size={14} />Order Mode</p><p className="text-sm font-semibold">{details.orderMode}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Layers2 size={14} />Job Type</p><p className="text-sm font-semibold">{details.jobType}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Tag size={14} />Item Type</p><p className="text-sm font-semibold">{details.itemType}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Users size={14} />Order Scope</p><p className="text-sm font-semibold">{currentJob.jobType}</p></div>
            <div className="row-between">
              <p className="text-sm text-muted row gap-4"><Ruler size={14} />Measurement</p>
              <div className="row gap-8">
                <p className="text-sm font-semibold">{measurementScopeText}</p>
                <Link to={`/jobs/${currentJob.id}/measurements`} className="job-measure-link">
                  <span>View</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Package size={14} />Material Type</p><p className="text-sm font-semibold">{details.materialType}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Palette size={14} />Color</p><p className="text-sm font-semibold">{details.color}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Ruler size={14} />Total Yard</p><p className="text-sm font-semibold">{details.totalYard}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><ShieldCheck size={14} />Material Quality</p><p className="text-sm font-semibold">{details.materialQuality}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Truck size={14} />Material Source</p><p className="text-sm font-semibold">{details.materialSource}</p></div>
          </div>
        </article>

        <article className="card stack gap-10">
          <h4 className="row gap-8">
            <span className="text-primary">₦</span>
            <span>Pricing</span>
          </h4>
          <div className="stack gap-8">
            <div className="row-between"><p className="text-sm text-muted row gap-4"><CircleDollarSign size={14} />Charge Amount</p><p className="text-sm font-semibold">{formatNaira(currentJob.chargeAmount)}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><HandCoins size={14} />Deposit Collected</p><p className="text-sm font-semibold">{formatNaira(details.depositAmount)}</p></div>
            <div className="row-between"><p className="text-sm text-muted row gap-4"><WalletCards size={14} />Amount to Collect After Job</p><p className="text-sm font-semibold">{formatNaira(balanceToCollect)}</p></div>
            <div className="divider" />
            <div className="stack gap-8">
              <p className="text-sm text-muted row gap-4"><List size={14} />Expenses List</p>
              {details.expenses.length ? (
                details.expenses.map((expense) => (
                  <div key={expense.name} className="row-between">
                    <p className="text-sm">{expense.name}</p>
                    <p className="text-sm font-semibold">{formatNaira(expense.cost)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No expenses added yet.</p>
              )}
            </div>
            <div className="divider" />
            <div className="row-between"><p className="text-sm text-muted row gap-4"><Receipt size={14} />Expenses Cost</p><p className="text-sm font-semibold text-danger">{formatNaira(totalExpenses)}</p></div>
            <div className="row-between">
              <p className="text-sm font-semibold row gap-4"><TrendingUp size={14} />Estimated Profit</p>
              <p className={`text-sm font-semibold ${estimatedProfit >= 0 ? 'text-success' : 'text-danger'}`}>{formatNaira(estimatedProfit)}</p>
            </div>
          </div>
        </article>

        <article className="card stack gap-10">
          <h4>Reference Photos</h4>
          <div className="job-photo-grid">
            {details.referencePhotos.map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                type="button"
                className="job-photo-button"
                onClick={() => setViewerIndex(index)}
                aria-label={`Open reference photo ${index + 1}`}
              >
                <img src={photo} alt={`Reference ${index + 1}`} className="job-photo-item" />
              </button>
            ))}
          </div>
        </article>

        <article className="card stack gap-10">
          <h4>Deadline</h4>
          <div className="stack gap-8">
            <p className="text-sm text-muted row gap-8">
              <CalendarDays size={15} />
              {formatDateNumeric(currentJob.deadlineDate)}
            </p>
            <p className="text-sm font-semibold">{formatDateWords(currentJob.deadlineDate)}</p>
            <p className="text-sm text-muted row gap-8">
              <Clock3 size={15} />
              {details.deliveryTime} ({formatTimeWords(details.deliveryTime)})
            </p>
            <p className="text-sm text-muted row gap-8">
              <Clock3 size={15} />
              Reminder: {details.reminder === 'none' ? 'No reminder' : details.reminder}
            </p>
          </div>
        </article>

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
        <div className="sheet-overlay job-image-viewer" role="dialog" aria-modal="true" aria-label="Reference image viewer">
          <button
            type="button"
            className="btn btn-ghost btn-icon job-image-nav job-image-nav-left"
            onClick={() => setViewerIndex((prev) => (prev === null ? 0 : (prev - 1 + details.referencePhotos.length) % details.referencePhotos.length))}
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="job-image-stage">
            <button type="button" className="btn btn-ghost btn-icon job-image-close" onClick={() => setViewerIndex(null)} aria-label="Close image viewer">
              <X size={20} />
            </button>
            <img src={activePhoto} alt="Full reference" className="job-image-full" />
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-icon job-image-nav job-image-nav-right"
            onClick={() => setViewerIndex((prev) => (prev === null ? 0 : (prev + 1) % details.referencePhotos.length))}
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>

          <p className="job-image-counter">{(viewerIndex ?? 0) + 1} / {details.referencePhotos.length}</p>
        </div>
      ) : null}

      {openDrawer ? (
        <div
          className="side-sheet-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${openDrawer} preview`}
          onClick={() => setOpenDrawer(null)}
        >
          <aside className="side-sheet" onClick={(event) => event.stopPropagation()}>
            <header className="side-sheet-header">
              <h4 className="side-sheet-title">{openDrawer === 'invoice' ? 'Invoice Preview' : 'Receipt Preview'}</h4>
              <button type="button" className="btn btn-ghost btn-icon side-sheet-close" onClick={() => setOpenDrawer(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </header>

            <div className="side-sheet-body">
              <div ref={docPreviewRef} className="job-doc-fullbleed side-sheet-doc-preview">
                <DocumentPreview
                  type={openDrawer}
                  brand={brand}
                  clientName={currentJob.clientName}
                  clientPhone={currentJob.clientPhone}
                  service={details.itemType}
                  lineItems={[
                    {
                      description: details.itemType,
                      details: `${details.jobType} • ${details.orderScope}`,
                      qty: 1,
                      unitPrice: currentJob.chargeAmount,
                      total: currentJob.chargeAmount,
                    },
                    ...details.expenses.slice(0, 2).map((expense) => ({
                      description: expense.name,
                      details: 'Work item',
                      qty: 1,
                      unitPrice: expense.cost,
                      total: expense.cost,
                    })),
                  ]}
                  charge={currentJob.chargeAmount}
                  deposit={details.depositAmount}
                  balance={balanceToCollect}
                  deadlineDate={currentJob.deadlineDate}
                />
              </div>

              <div className="stack gap-8 side-sheet-actions">
                <button type="button" className="btn btn-primary btn-full" onClick={() => void handleSystemShare(openDrawer)}>
                  <Share2 size={16} />
                  Share
                </button>
                <button type="button" className="btn btn-full whatsapp-send-btn" onClick={() => void handleWhatsAppToClient(openDrawer)}>
                  <FaWhatsapp size={18} />
                  Send to Client (WhatsApp)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={async () => {
                    const blob = await buildPdfBlob()
                    if (!blob) return
                    triggerPdfDownload(blob, openDrawer)
                  }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}


