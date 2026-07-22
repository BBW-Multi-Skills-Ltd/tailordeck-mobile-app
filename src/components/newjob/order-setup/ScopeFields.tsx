import { scopeForBodyWear, scopeForNonBody, type JobType, type MakeCategory } from '../newJobConfig'

export function OrderScopeField({
  jobType,
  makeCategory,
  onJobTypeChange,
}: {
  jobType: JobType
  makeCategory: MakeCategory
  onJobTypeChange: (value: JobType) => void
}) {
  return (
    <div className="input-group">
      <span className="input-label">Order Scope</span>
      <div className="wizard-jobtype-group">
        {(makeCategory === 'Body Wear' ? scopeForBodyWear : scopeForNonBody).map((type) => (
          <button key={type} type="button" className={`pill wizard-jobtype-pill${jobType === type ? ' active' : ''}`} onClick={() => onJobTypeChange(type)}>
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SameItemToggle({ onSameItemToggle, sameItemForAll }: { sameItemForAll: boolean; onSameItemToggle: (value: boolean) => void }) {
  return (
    <div className="input-group">
      <span className="input-label">Use same item for everyone?</span>
      <div className="wizard-sex-group">
        <button type="button" className={`pill wizard-jobtype-pill${sameItemForAll ? ' active' : ''}`} onClick={() => onSameItemToggle(true)}>
          Same Item
        </button>
        <button type="button" className={`pill wizard-jobtype-pill${!sameItemForAll ? ' active' : ''}`} onClick={() => onSameItemToggle(false)}>
          Different Items
        </button>
      </div>
    </div>
  )
}
