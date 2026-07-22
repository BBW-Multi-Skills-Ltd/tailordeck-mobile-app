type SignOutConfirmDialogProps = {
  onCancel: () => void
  onConfirm: () => void
}

export default function SignOutConfirmDialog({ onCancel, onConfirm }: SignOutConfirmDialogProps) {
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Sign out confirmation" onClick={onCancel}>
      <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
        <h3>Sign out?</h3>
        <p>You will leave this TailorDeck account on this device.</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Stay Signed In
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
