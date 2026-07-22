import { Check, X } from 'lucide-react'

export function WorthItSelector({
  onWorthItChange,
  worthIt,
}: {
  worthIt: 'Yes' | 'No'
  onWorthItChange: (value: 'Yes' | 'No') => void
}) {
  return (
    <div className="input-group">
      <span className="wizard-section-label">Is this job worth it?</span>
      <div className="wizard-worth-grid">
        <button
          type="button"
          className={`wizard-worth-btn${worthIt === 'Yes' ? ' active-yes' : ''}`}
          onClick={() => onWorthItChange('Yes')}
        >
          <Check size={16} />
          Yes, proceed
        </button>
        <button
          type="button"
          className={`wizard-worth-btn danger${worthIt === 'No' ? ' active-no' : ''}`}
          onClick={() => onWorthItChange('No')}
        >
          <X size={16} />
          Not worth it
        </button>
      </div>
      {worthIt === 'No' ? (
        <p className="text-sm text-danger">Consider revising price or reducing costs before finalizing.</p>
      ) : null}
    </div>
  )
}
