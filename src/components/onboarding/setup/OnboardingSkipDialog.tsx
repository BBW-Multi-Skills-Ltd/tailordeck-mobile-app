type OnboardingSkipDialogProps = {
  onClose: () => void
  onSkip: () => void
}

export function OnboardingSkipDialog({ onClose, onSkip }: OnboardingSkipDialogProps) {
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Skip setup confirmation" onClick={onClose}>
      <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
        <h3>Skip shop setup?</h3>
        <p>Completing this now helps TailorDeck prepare cleaner invoices, receipts, and business details for your clients.</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Continue Setup
          </button>
          <button type="button" className="btn btn-secondary" onClick={onSkip}>
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  )
}
