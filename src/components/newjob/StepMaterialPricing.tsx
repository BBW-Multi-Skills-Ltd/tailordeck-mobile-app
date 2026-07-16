import { CheckCircle2, Sparkles, Wrench } from 'lucide-react'
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
        <section className="wizard-material-decision-card">
          <div className="wizard-material-decision-head">
            <span className="wizard-material-decision-icon">
              <Wrench size={17} />
            </span>
            <div>
              <strong>Does this repair need materials?</strong>
              <p>Choose yes only if you need parts like zip, buttons, lining, patch fabric, or thread.</p>
            </div>
          </div>
          <div className="wizard-sex-group">
            <button type="button" className={`pill wizard-jobtype-pill${props.amendmentNeedsMaterials ? ' active' : ''}`} onClick={() => props.onAmendmentMaterialsToggle(true)}>
              Yes, add parts
            </button>
            <button type="button" className={`pill wizard-jobtype-pill${!props.amendmentNeedsMaterials ? ' active' : ''}`} onClick={() => props.onAmendmentMaterialsToggle(false)}>
              No, labor only
            </button>
          </div>
        </section>
      ) : null}

      {props.showFullMaterialFlow || props.showAmendmentMaterialFlow ? (
        <section className="stack gap-10">
          {props.showFullMaterialFlow ? <MaterialFlowFields {...props} /> : null}
          {props.showAmendmentMaterialFlow ? <AmendmentMaterialFields {...props} /> : null}
          <MaterialSourceSelector {...props} />
        </section>
      ) : null}

      {props.isAmendmentMode && !props.amendmentNeedsMaterials ? (
        <article className="wizard-no-material-card">
          <CheckCircle2 size={18} />
          <div>
            <strong>Labor-only repair</strong>
            <p>No parts will be added. Continue with the client charge and deposit.</p>
          </div>
        </article>
      ) : null}

      <section className="stack gap-10">
        <div className="wizard-step-section-heading">
          <span>
            <CheckCircle2 size={15} />
          </span>
          <div>
            <strong>Pricing</strong>
            <p>Set the agreed charge and deposit. Balance is calculated for you.</p>
          </div>
        </div>
        <PricingDepositFields {...props} />
      </section>

      <section className="stack gap-8">
        <div className="wizard-step-section-heading">
          <span>
            <Sparkles size={15} />
          </span>
          <div>
            <strong>Reference photo</strong>
            <p>Optional, but useful when the client wants a specific style.</p>
          </div>
        </div>
        <ReferencePhotoUpload referencePhotoNames={props.referencePhotoNames} onReferencePhotoUpload={props.onReferencePhotoUpload} />
      </section>
    </div>
  )
}
