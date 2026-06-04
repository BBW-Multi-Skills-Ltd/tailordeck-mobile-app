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

