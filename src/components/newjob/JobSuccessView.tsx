import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { formatNaira } from '../../lib/utils'

type JobSuccessViewProps = {
  clientName: string
  jobType: string
  charge: number
  deadlineDate: string
  onViewJobs: () => void
}

export function JobSuccessView({ clientName, jobType, charge, deadlineDate, onViewJobs }: JobSuccessViewProps) {
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

        <button type="button" className="btn btn-primary btn-full" onClick={onViewJobs}>
          View in Jobs <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

