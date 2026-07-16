import { CheckCircle2 } from 'lucide-react'
import { materialSources } from './newJobConfig'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

type MaterialSourceSelectorProps = Pick<StepMaterialPricingProps, 'materialSource' | 'onMaterialSourceChange'>

export function MaterialSourceSelector({ materialSource, onMaterialSourceChange }: MaterialSourceSelectorProps) {
  const sourceLabel = materialSource === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'

  return (
    <div className="stack gap-8">
      <div className="input-group">
        <span className="input-label">Material Source</span>
        <p className="text-sm text-muted wizard-helper-inline">Who is providing the material?</p>
        <div className="wizard-material-quick-row" aria-label="Material source">
          {materialSources.map((source) => {
            const label = source === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'
            return (
              <button key={source} type="button" className={`wizard-source-chip${materialSource === source ? ' active' : ''}`} onClick={() => onMaterialSourceChange(source)}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {materialSource ? (
        <div className="wizard-selected-material">
          <CheckCircle2 size={16} />
          <div>
            <strong>{sourceLabel}</strong>
            <p>Material source selected</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
