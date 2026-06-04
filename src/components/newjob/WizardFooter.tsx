import { ArrowRight } from 'lucide-react'

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
              Next <ArrowRight size={16} />
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

