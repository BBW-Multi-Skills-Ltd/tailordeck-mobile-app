import { materialSources } from './newJobConfig'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

type MaterialSourceSelectorProps = Pick<StepMaterialPricingProps, 'materialSource' | 'onMaterialSourceChange'>

export function MaterialSourceSelector({ materialSource, onMaterialSourceChange }: MaterialSourceSelectorProps) {
  return (
    <div className="input-group">
      <span className="input-label">Material Source</span>
      <div className="wizard-source-grid">
        {materialSources.map((source) => (
          <button key={source} type="button" className={`wizard-material-source-btn${materialSource === source ? ' active' : ''}`} onClick={() => onMaterialSourceChange(source)}>
            {source === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'}
          </button>
        ))}
      </div>
    </div>
  )
}
