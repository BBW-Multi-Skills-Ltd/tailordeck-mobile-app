import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatNaira } from '../../lib/utils'

type NewJobHeaderProps = {
  onBack: () => void
}

export function NewJobHeader({ onBack }: NewJobHeaderProps) {
  return (
    <div className="row-between">
      <button type="button" className="btn btn-ghost btn-icon" onClick={onBack} aria-label="Back">
        <ArrowLeft size={18} />
      </button>
      <h2 className="app-page-heading">New Job</h2>
      <span style={{ width: '44px' }} />
    </div>
  )
}

type StepProgressProps = {
  step: number
  labels: readonly string[]
}

export function StepProgress({ step, labels }: StepProgressProps) {
  return (
    <div className="stack gap-8">
      <p className="text-sm text-muted">
        Step {step + 1} of {labels.length} - {labels[step]}
      </p>
      <div className="step-progress">
        {labels.map((label, index) => (
          <div
            key={label}
            className={`step-bar${index < step ? ' done' : ''}${index === step ? ' active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

type WizardFooterProps = {
  step: number
  isReviewMode: boolean
  isFinalizing: boolean
  onBack: () => void
  onNext: () => void
  onProceedToReview: () => void
  onSaveDraft: () => void
  onFinalize: () => void
}

export function WizardFooter({
  step,
  isReviewMode,
  isFinalizing,
  onBack,
  onNext,
  onProceedToReview,
  onSaveDraft,
  onFinalize,
}: WizardFooterProps) {
  return (
    <div className="wizard-footer">
      <div className="wizard-footer-inner">
        {step < 3 ? (
          <>
            <button type="button" className="btn btn-secondary flex-1" onClick={onBack}>
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            <button type="button" className="btn btn-primary flex-1" onClick={onNext}>
              <>
                Next <ArrowRight size={16} />
              </>
            </button>
          </>
        ) : !isReviewMode ? (
          <>
            <button type="button" className="btn btn-secondary flex-1" onClick={onBack}>
              Back
            </button>
            <button type="button" className="btn btn-primary flex-1" onClick={onProceedToReview}>
              Proceed to Review
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-secondary flex-1" onClick={onSaveDraft}>
              Save as Draft
            </button>
            <button type="button" className="btn btn-primary flex-1" onClick={onFinalize} disabled={isFinalizing}>
              {isFinalizing ? 'Finalizing...' : 'Confirm & Finalize Job'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

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
          <div className="row-between"><p className="text-sm text-muted">Type</p><p className="font-semibold">{jobType}</p></div>
          <div className="row-between"><p className="text-sm text-muted">Charge</p><p className="font-semibold">{formatNaira(charge)}</p></div>
          <div className="row-between"><p className="text-sm text-muted">Delivery</p><p className="font-semibold">{deadlineDate || '-'}</p></div>
          <div className="row-between"><p className="text-sm text-muted">Status</p><p className="wizard-pending-text">Pending ⏳</p></div>
        </div>

        <button type="button" className="btn btn-primary btn-full" onClick={onViewJobs}>
          View in Jobs <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export function WizardLoadingOverlay() {
  return (
    <div className="sheet-overlay wizard-loading-overlay">
      <div className="card stack gap-10 wizard-loading-card">
        <div className="wizard-spinner" />
        <p className="text-sm text-muted">Creating contract...</p>
      </div>
    </div>
  )
}

type ReviewRowProps = {
  icon: ReactNode
  label: string
  value: string
  valueClassName?: string
}

export function ReviewRow({ icon, label, value, valueClassName }: ReviewRowProps) {
  return (
    <div className="wizard-detail-row">
      <span className="wizard-detail-icon">{icon}</span>
      <p className="wizard-detail-line">
        <span className="text-muted">{label}:</span> <strong className={valueClassName}>{value || '-'}</strong>
      </p>
    </div>
  )
}
