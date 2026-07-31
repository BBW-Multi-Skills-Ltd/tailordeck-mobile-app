type WizardLoadingOverlayProps = {
  message?: string
}

export function WizardLoadingOverlay({ message = 'Creating contract...' }: WizardLoadingOverlayProps) {
  return (
    <div className="sheet-overlay wizard-loading-overlay">
      <div className="card stack gap-10 wizard-loading-card">
        <div className="wizard-spinner" />
        <p className="text-sm text-muted">{message}</p>
      </div>
    </div>
  )
}
