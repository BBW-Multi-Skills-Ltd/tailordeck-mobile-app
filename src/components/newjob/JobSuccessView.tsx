import { ArrowRight, CheckCircle2, FileText, Home } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DetailedJobData } from '../../data/mockJobDetails'
import { formatNaira } from '../../lib/utils'
import type { MockJob } from '../../types/job'
import { readBrandConfig } from '../invoice/documentHelpers'
import { JobDocumentDrawer } from '../jobdetail/JobDocumentDrawer'
import { useJobDocumentActions } from '../jobdetail/useJobDocumentActions'
import type { ExpenseForm, JobType, MakeCategory, OrderMode, Reminder } from './newJobConfig'

type JobSuccessViewProps = {
  clientName: string
  clientPhone: string
  color: string
  deadlineTime: string
  deposit: number
  effectiveItemType: string
  expenses: ExpenseForm[]
  jobType: string
  makeCategory: MakeCategory
  materialQuality: string
  materialSource: string
  materialType: string
  orderMode: OrderMode
  reminder: Reminder
  scopeLabel: JobType | string
  charge: number
  deadlineDate: string
  totalYard: string
  onViewJobDetails: () => void
}

export function JobSuccessView({
  clientName,
  clientPhone,
  color,
  deadlineTime,
  deposit,
  effectiveItemType,
  expenses,
  jobType,
  makeCategory,
  materialQuality,
  materialSource,
  materialType,
  orderMode,
  reminder,
  scopeLabel,
  charge,
  deadlineDate,
  totalYard,
  onViewJobDetails,
}: JobSuccessViewProps) {
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const navigate = useNavigate()
  const brand = useMemo(() => readBrandConfig(), [])
  const balanceToCollect = Math.max(charge - deposit, 0)
  const service = effectiveItemType || 'Tailoring job'
  const successJob = useMemo<MockJob>(
    () => ({
      id: `new-job-${Date.now()}`,
      clientId: 'new-client',
      clientName: clientName || 'Client',
      clientPhone,
      title: service,
      jobType: scopeLabel === 'Couple' || scopeLabel === 'Family' ? scopeLabel : 'Single',
      chargeAmount: charge,
      status: 'Pending',
      deadlineDate,
      createdDate: new Date().toISOString(),
    }),
    [charge, clientName, clientPhone, deadlineDate, scopeLabel, service],
  )
  const successDetails = useMemo<DetailedJobData>(
    () => ({
      orderMode,
      jobType: makeCategory,
      itemType: service,
      orderScope: jobType,
      measurement: `${jobType} measurement captured`,
      materialType: materialType || '-',
      color: color || '-',
      totalYard: totalYard || '0',
      materialQuality: materialQuality || 'Normal',
      materialSource: materialSource || '-',
      deliveryTime: deadlineTime || '-',
      reminder,
      referencePhotos: [],
      expenses: expenses.map((expense) => ({
        name: expense.name,
        cost: Number(expense.cost.replace(/\D/g, '')) || 0,
      })),
      depositAmount: deposit,
    }),
    [
      color,
      deadlineTime,
      deposit,
      expenses,
      jobType,
      makeCategory,
      materialQuality,
      materialSource,
      materialType,
      orderMode,
      reminder,
      service,
      totalYard,
    ],
  )
  const { docPreviewRef, handleDownload, handleSystemShare, handleWhatsAppToClient } = useJobDocumentActions({
    brand,
    job: successJob,
    details: successDetails,
    balanceToCollect,
  })

  return (
    <section className="section stack gap-16 wizard-page wizard-success-page">
      <div className="stack gap-16 wizard-success-screen">
        <div className="wizard-success-icon-wrap">
          <CheckCircle2 size={58} className="wizard-success-icon" />
        </div>
        <p className="wizard-success-kicker">JOB CONFIRMED</p>
        <h2 className="wizard-success-title">Contract Created!</h2>
        <p className="text-sm text-muted wizard-success-sub">You now have a contract with</p>
        <p className="wizard-success-client">{clientName || 'Client'}</p>

        <div className="card stack gap-8 wizard-success-summary-card">
          <div className="row-between">
            <p className="text-sm text-muted">Type</p>
            <p className="font-semibold">{jobType}</p>
          </div>
          <div className="row-between">
            <p className="text-sm text-muted">Charge</p>
            <p className="font-semibold">{formatNaira(charge)}</p>
          </div>
          <div className="row-between">
            <p className="text-sm text-muted">Delivery</p>
            <p className="font-semibold">{deadlineDate || '-'}</p>
          </div>
          <div className="row-between">
            <p className="text-sm text-muted">Status</p>
            <p className="wizard-pending-text">Pending</p>
          </div>
        </div>

        <div className="wizard-success-action-row">
          <button type="button" className="btn btn-primary btn-full" onClick={onViewJobDetails}>
            View Details <ArrowRight size={16} />
          </button>

          <button type="button" className="btn btn-secondary btn-full wizard-success-invoice-btn" onClick={() => setInvoiceOpen(true)}>
            <FileText size={16} />
            Send Invoice
          </button>
        </div>

        <button type="button" className="btn btn-ghost btn-full wizard-success-home-btn" onClick={() => navigate('/')}>
          <Home size={16} />
          Return to Home
        </button>
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
