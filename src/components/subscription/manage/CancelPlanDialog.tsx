type CancelPlanDialogProps = {
  isPaidPlan: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CancelPlanDialog({ isPaidPlan, onClose, onConfirm }: CancelPlanDialogProps) {
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Cancel subscription" onClick={onClose}>
      <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
        <h3>{isPaidPlan ? 'Cancel subscription?' : 'Cancel free trial?'}</h3>
        <p>
          {isPaidPlan
            ? 'Your plan will stay active until the end of the current billing period.'
            : 'Your trial will stay active until it ends. No payment will be taken.'}
        </p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Keep {isPaidPlan ? 'Plan' : 'Trial'}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Cancel at Period End
          </button>
        </div>
      </div>
    </div>
  )
}
