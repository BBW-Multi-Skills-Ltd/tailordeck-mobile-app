import { formatNaira } from '../../../lib/utils'

export function JobSuccessSummaryCard({ charge, deadlineDate, jobType }: { charge: number; deadlineDate: string; jobType: string }) {
  return (
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
  )
}
