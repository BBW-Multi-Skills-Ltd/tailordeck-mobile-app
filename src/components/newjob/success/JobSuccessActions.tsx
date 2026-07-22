import { ArrowRight, FileText, Home } from 'lucide-react'

export function JobSuccessActions({
  onOpenInvoice,
  onReturnHome,
  onViewJobDetails,
}: {
  onViewJobDetails: () => void
  onOpenInvoice: () => void
  onReturnHome: () => void
}) {
  return (
    <>
      <div className="wizard-success-action-row">
        <button type="button" className="btn btn-primary btn-full" onClick={onViewJobDetails}>
          View Details <ArrowRight size={16} />
        </button>

        <button type="button" className="btn btn-secondary btn-full wizard-success-invoice-btn" onClick={onOpenInvoice}>
          <FileText size={16} />
          Send Invoice
        </button>
      </div>

      <button type="button" className="btn btn-ghost btn-full wizard-success-home-btn" onClick={onReturnHome}>
        <Home size={16} />
        Return to Home
      </button>
    </>
  )
}
