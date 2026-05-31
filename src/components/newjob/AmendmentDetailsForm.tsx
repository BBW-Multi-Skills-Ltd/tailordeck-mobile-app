import { amendmentIssueOptions } from './newJobConfig'

type AmendmentDetailsFormProps = {
  issueType: string
  area: string
  target: string
  description: string
  onIssueTypeChange: (value: string) => void
  onAreaChange: (value: string) => void
  onTargetChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export default function AmendmentDetailsForm({
  issueType,
  area,
  target,
  description,
  onIssueTypeChange,
  onAreaChange,
  onTargetChange,
  onDescriptionChange,
}: AmendmentDetailsFormProps) {
  return (
    <div className="stack gap-8 wizard-step1-measurements">
      <p className="input-label">Amendment / Repair Details</p>
      <article className="card stack gap-12">
        <label className="input-group">
          <span className="input-label">Issue Type</span>
          <input
            className="input"
            value={issueType}
            onChange={(event) => onIssueTypeChange(event.target.value)}
            placeholder="e.g. Zip replacement, Tighten waist"
            list="amendment-issue-options"
          />
          <datalist id="amendment-issue-options">
            {amendmentIssueOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>

        <label className="input-group">
          <span className="input-label">Affected Area</span>
          <input className="input" value={area} onChange={(event) => onAreaChange(event.target.value)} placeholder="e.g. Waist, Sleeve, Zip area" />
        </label>

        <label className="input-group">
          <span className="input-label">Target Adjustment</span>
          <input className="input" value={target} onChange={(event) => onTargetChange(event.target.value)} placeholder="e.g. Reduce by 2 inches, replace with quality zip" />
        </label>

        <label className="input-group">
          <span className="input-label">Description (optional)</span>
          <input className="input" value={description} onChange={(event) => onDescriptionChange(event.target.value)} placeholder="Any extra notes about the amendment" />
        </label>
      </article>
    </div>
  )
}
