import { AmendmentMaterialFields } from './AmendmentMaterialFields'
import { MaterialFlowFields } from './MaterialFlowFields'
import { MaterialSourceSelector } from './MaterialSourceSelector'
import { PricingDepositFields } from './PricingDepositFields'
import { ReferencePhotoUpload } from './ReferencePhotoUpload'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

export default function StepMaterialPricing(props: StepMaterialPricingProps) {
  return (
    <div className="stack gap-12">
      {props.isAmendmentMode ? (
        <div className="input-group">
          <span className="input-label">Need extra materials or parts?</span>
          <div className="wizard-sex-group">
            <button type="button" className={`pill wizard-jobtype-pill${props.amendmentNeedsMaterials ? ' active' : ''}`} onClick={() => props.onAmendmentMaterialsToggle(true)}>
              Yes
            </button>
            <button type="button" className={`pill wizard-jobtype-pill${!props.amendmentNeedsMaterials ? ' active' : ''}`} onClick={() => props.onAmendmentMaterialsToggle(false)}>
              No
            </button>
          </div>
        </div>
      ) : null}

      {props.showFullMaterialFlow ? <MaterialFlowFields {...props} /> : null}
      {props.showAmendmentMaterialFlow ? <AmendmentMaterialFields {...props} /> : null}
      {props.showFullMaterialFlow || props.showAmendmentMaterialFlow ? <MaterialSourceSelector {...props} /> : null}

      {props.isAmendmentMode && !props.amendmentNeedsMaterials ? (
        <article className="card stack gap-6">
          <p className="text-sm text-muted">No extra material selected for this amendment.</p>
          <p className="text-sm text-muted">You can continue with pricing and labor costing.</p>
        </article>
      ) : null}

      <PricingDepositFields {...props} />
      <ReferencePhotoUpload referencePhotoNames={props.referencePhotoNames} onReferencePhotoUpload={props.onReferencePhotoUpload} />
    </div>
  )
}
