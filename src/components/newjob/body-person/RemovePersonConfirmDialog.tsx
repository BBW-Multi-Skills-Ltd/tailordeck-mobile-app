import { createPortal } from 'react-dom'

export function RemovePersonConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  personId,
  title,
}: {
  isOpen: boolean
  personId: string
  title: string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="wizard-confirm-overlay"
      role="presentation"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
      }}
    >
      <div
        className="wizard-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`remove-${personId}-title`}
        aria-describedby={`remove-${personId}-desc`}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <p id={`remove-${personId}-title`} className="wizard-confirm-title">Remove {title}?</p>
        <p id={`remove-${personId}-desc`} className="wizard-confirm-copy">This person&apos;s measurements will be removed from this job.</p>
        <div className="wizard-confirm-actions">
          <button
            type="button"
            className="btn btn-secondary flex-1"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onCancel()
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger flex-1"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onConfirm()
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
