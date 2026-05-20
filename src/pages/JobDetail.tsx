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
  MessageCircle,
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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import { jobMeasurementById } from '../data/mockJobMeasurements'
import { mockJobs } from '../data/mockJobs'
import { formatDateShort, formatNaira, getInitial } from '../lib/utils'
import type { JobStatus } from '../types/job'

type InvoiceType = 'invoice' | 'receipt'

type DetailedExpense = {
  name: string
  cost: number
}

type DetailedJobData = {
  orderMode: 'New Stitch' | 'Amendment / Repair'
  jobType: 'Body Wear' | 'Non-Body Item'
  itemType: string
  orderScope: string
  measurement: string
  materialType: string
  color: string
  totalYard: string
  materialQuality: string
  materialSource: string
  deliveryTime: string
  reminder: string
  referencePhotos: string[]
  expenses: DetailedExpense[]
  depositAmount: number
}

type BrandConfig = {
  shopName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const detailedMockByJobId: Record<string, DetailedJobData> = {
  'j-001': {
    orderMode: 'New Stitch',
    jobType: 'Body Wear',
    itemType: 'Wedding Lace Gown',
    orderScope: 'Single',
    measurement: 'Body wear measurement captured (Female)',
    materialType: 'Lace',
    color: 'Wine / Gold',
    totalYard: '8',
    materialQuality: 'High Standard',
    materialSource: 'Client Provided',
    deliveryTime: '14:30',
    reminder: '3 days before',
    referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
    expenses: [
      { name: 'Transport', cost: 5500 },
      { name: 'Lining + Thread', cost: 17000 },
      { name: 'Stone Work', cost: 14500 },
    ],
    depositAmount: 120000,
  },
  'j-002': {
    orderMode: 'Amendment / Repair',
    jobType: 'Body Wear',
    itemType: 'Church Native Set',
    orderScope: 'Single',
    measurement: 'Amendment details captured',
    materialType: 'Zip',
    color: 'Navy',
    totalYard: '1',
    materialQuality: 'Normal',
    materialSource: 'I Am Getting It',
    deliveryTime: '12:00',
    reminder: '1 day before',
    referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
    expenses: [
      { name: 'Fabric Purchase', cost: 35000 },
      { name: 'Accessories', cost: 8500 },
    ],
    depositAmount: 70000,
  },
  'j-003': {
    orderMode: 'New Stitch',
    jobType: 'Body Wear',
    itemType: 'Senator Couple Set',
    orderScope: 'Couple',
    measurement: '2 body profiles captured',
    materialType: 'Guinea Brocade',
    color: 'Navy',
    totalYard: '5',
    materialQuality: 'Normal',
    materialSource: 'Client Provided',
    deliveryTime: '16:00',
    reminder: 'none',
    referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
    expenses: [
      { name: 'Embroidery', cost: 22000 },
      { name: 'Buttons + Lining', cost: 7000 },
    ],
    depositAmount: 250000,
  },
  'j-004': {
    orderMode: 'New Stitch',
    jobType: 'Body Wear',
    itemType: 'Agbada Set',
    orderScope: 'Couple',
    measurement: '2 body profiles captured',
    materialType: 'Aso Oke',
    color: 'Cream',
    totalYard: '10',
    materialQuality: 'High Standard',
    materialSource: 'Client Provided',
    deliveryTime: '15:15',
    reminder: '1 week before',
    referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
    expenses: [
      { name: 'Machine Maintenance', cost: 9000 },
      { name: 'Extra Tailor Support', cost: 30000 },
    ],
    depositAmount: 170000,
  },
  'j-005': {
    orderMode: 'New Stitch',
    jobType: 'Body Wear',
    itemType: 'Aso-Ebi Family Pack',
    orderScope: 'Family',
    measurement: '3 person profiles captured',
    materialType: 'Ankara',
    color: 'Emerald Green',
    totalYard: '18',
    materialQuality: 'Original',
    materialSource: 'I Am Getting It',
    deliveryTime: '11:00',
    reminder: '3 days before',
    referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
    expenses: [
      { name: 'Fabric Purchase', cost: 140000 },
      { name: 'Labor', cost: 60000 },
      { name: 'Finishing', cost: 17000 },
    ],
    depositAmount: 300000,
  },
  'j-006': {
    orderMode: 'New Stitch',
    jobType: 'Body Wear',
    itemType: 'Family Native Set',
    orderScope: 'Family',
    measurement: '3 person profiles captured',
    materialType: 'Ankara',
    color: 'Deep Green',
    totalYard: '14',
    materialQuality: 'Original',
    materialSource: 'Client Provided',
    deliveryTime: '13:00',
    reminder: '3 days before',
    referencePhotos: ['/avatar-placeholder.svg', '/avatar-placeholder.svg', '/avatar-placeholder.svg'],
    expenses: [
      { name: 'Fabric Purchase', cost: 120000 },
      { name: 'Labor', cost: 50000 },
      { name: 'Finishing', cost: 14000 },
    ],
    depositAmount: 220000,
  },
}

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

function normalizeNigerianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  return `234${digits}`
}

function buildWhatsAppURL(phone: string, message: string): string {
  const normalized = normalizeNigerianPhone(phone)
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

function readBrandConfig(): BrandConfig {
  const defaults: BrandConfig = {
    shopName: 'Elon Apparel',
    primaryColor: '#7B1E37',
    secondaryColor: '#F6ECF0',
    accentColor: '#C9A84C',
  }

  if (typeof window === 'undefined') return defaults

  const possibleKeys = ['tailordeck-settings', 'tailordeck-brand']
  for (const key of possibleKeys) {
    const raw = window.localStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as {
        brand?: { name?: string; colors?: string[] }
        shop_name?: string
        shopName?: string
      }
      const colors = parsed.brand?.colors ?? []

      return {
        shopName: parsed.brand?.name ?? parsed.shop_name ?? parsed.shopName ?? defaults.shopName,
        primaryColor: colors[0] ?? defaults.primaryColor,
        secondaryColor: colors[1] ?? defaults.secondaryColor,
        accentColor: colors[2] ?? defaults.accentColor,
      }
    } catch {
      return defaults
    }
  }

  return defaults
}

function buildDocumentShareText(params: {
  type: InvoiceType
  shopName: string
  clientName: string
  clientPhone: string
  service: string
  charge: number
  deposit: number
  balance: number
  deadlineDate: string
}): string {
  const { type, shopName, clientName, clientPhone, service, charge, deposit, balance, deadlineDate } = params
  const heading = type === 'invoice' ? 'INVOICE' : 'RECEIPT'

  return [
    `${shopName} ${heading}`,
    '',
    `Client: ${clientName}`,
    `Phone: ${clientPhone}`,
    `Service: ${service}`,
    `Charge: ${formatNaira(charge)}`,
    `Deposit: ${formatNaira(deposit)}`,
    type === 'invoice' ? `Balance to Pay: ${formatNaira(balance)}` : `Amount Received: ${formatNaira(charge)}`,
    `Delivery Date: ${formatDateShort(deadlineDate)}`,
  ].join('\n')
}

function DocumentPreview({
  type,
  brand,
  clientName,
  clientPhone,
  service,
  charge,
  deposit,
  balance,
  deadlineDate,
}: {
  type: InvoiceType
  brand: BrandConfig
  clientName: string
  clientPhone: string
  service: string
  charge: number
  deposit: number
  balance: number
  deadlineDate: string
}): ReactElement {
  const documentId = `${type}-${Math.abs((service + deadlineDate).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)).toString(16).slice(0, 6)}`

  return (
    <div className="stack gap-12">
      <h4 className="job-doc-ui-title">{type === 'invoice' ? 'Invoice Preview' : 'Receipt Preview'}</h4>

      <div className="card stack gap-10 job-doc-preview-card" style={{ borderColor: `${brand.primaryColor}33` }}>
        <div className="job-doc-preview-bar" style={{ background: brand.primaryColor }} />

        <div className="row-between">
          <div className="stack gap-4">
            <p className="text-sm" style={{ color: brand.primaryColor, fontWeight: 700 }}>{brand.shopName}</p>
            <p className="text-sm text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{type}</p>
          </div>
          <div className="stack gap-4" style={{ textAlign: 'right' }}>
            <p className="text-sm font-semibold">{documentId}</p>
            <p className="text-sm text-muted">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="stack gap-4">
          <p className="text-sm" style={{ color: brand.primaryColor, fontWeight: 600 }}>Billed To</p>
          <p className="text-sm font-semibold">{clientName}</p>
          <p className="text-sm text-muted">{clientPhone}</p>
        </div>

        <div className="divider" />

        <div className="stack gap-6">
          <p className="text-sm" style={{ color: brand.primaryColor, fontWeight: 600 }}>Description</p>
          <div className="row-between">
            <p className="text-sm text-muted">Service Details</p>
            <p className="text-sm font-semibold">{service}</p>
          </div>
          <div className="row-between">
            <p className="text-sm text-muted">Charge Amount</p>
            <p className="text-sm font-semibold">{formatNaira(charge)}</p>
          </div>
          <div className="row-between">
            <p className="text-sm text-muted">Deposit Paid</p>
            <p className="text-sm font-semibold">{formatNaira(deposit)}</p>
          </div>
          <div className="row-between">
            <p className="text-sm text-muted">{type === 'invoice' ? 'Balance to Pay' : 'Amount Received'}</p>
            <p className="text-sm font-semibold" style={{ color: type === 'invoice' ? brand.primaryColor : 'var(--success)' }}>
              {type === 'invoice' ? formatNaira(balance) : formatNaira(charge)}
            </p>
          </div>
          <div className="row-between">
            <p className="text-sm text-muted">Delivery Date</p>
            <p className="text-sm font-semibold">{formatDateShort(deadlineDate)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const [openDrawer, setOpenDrawer] = useState<InvoiceType | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const docPreviewRef = useRef<HTMLDivElement | null>(null)
  const drawerDragStartYRef = useRef<number | null>(null)

  const job = id ? mockJobs.find((item) => item.id === id) : undefined
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
        <h2>Job Not Found</h2>
        <p className="text-muted">This job may have been removed.</p>
        <Link to="/jobs" className="btn btn-secondary">
          Back to Jobs
        </Link>
      </section>
    )
  }

  const currentJob = job
  const measurementSnapshot = jobMeasurementById[currentJob.id]
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

  function handleDrawerHandlePointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
    drawerDragStartYRef.current = event.clientY
  }

  function handleDrawerHandlePointerUp(event: ReactPointerEvent<HTMLButtonElement>): void {
    if (drawerDragStartYRef.current === null) return
    const deltaY = event.clientY - drawerDragStartYRef.current
    drawerDragStartYRef.current = null

    if (deltaY > 45) {
      setOpenDrawer(null)
    }
  }

  return (
    <>
      <section className="section stack gap-16">
        <header className="row-between">
          <Link to="/jobs" className="btn btn-ghost btn-icon" aria-label="Back to jobs">
            <ArrowLeft size={18} />
          </Link>
          <h2>Job Details</h2>
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
        <div className="sheet-overlay" role="dialog" aria-modal="true" aria-label={`${openDrawer} preview drawer`}>
          <div className="sheet">
            <button
              type="button"
              className="sheet-handle-button"
              aria-label="Drag down to close drawer"
              onPointerDown={handleDrawerHandlePointerDown}
              onPointerUp={handleDrawerHandlePointerUp}
            >
              <span className="sheet-handle" />
            </button>
            <section className="section stack gap-12">
              <div ref={docPreviewRef}>
                <DocumentPreview
                  type={openDrawer}
                  brand={brand}
                  clientName={currentJob.clientName}
                  clientPhone={currentJob.clientPhone}
                  service={details.itemType}
                  charge={currentJob.chargeAmount}
                  deposit={details.depositAmount}
                  balance={balanceToCollect}
                  deadlineDate={currentJob.deadlineDate}
                />
              </div>

              <div className="stack gap-8">
                <div className="row gap-8">
                  <button type="button" className="btn btn-primary flex-1" onClick={() => void handleSystemShare(openDrawer)}>
                    <Share2 size={16} />
                    Share
                  </button>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => void handleWhatsAppToClient(openDrawer)}>
                    <MessageCircle size={16} />
                    Send to Client
                  </button>
                </div>
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
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setOpenDrawer(null)}>
                  Close
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  )
}
