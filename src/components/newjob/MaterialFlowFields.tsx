import { materialCategories, qualities } from './newJobConfig'
import MaterialSelector from './MaterialSelector'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

type MaterialFlowFieldsProps = Pick<
  StepMaterialPricingProps,
  | 'customMaterialType'
  | 'materialColor'
  | 'materialQuality'
  | 'materialType'
  | 'materialYards'
  | 'openMaterialCategory'
  | 'onCustomMaterialTypeChange'
  | 'onMaterialColorChange'
  | 'onMaterialQualityChange'
  | 'onMaterialTypeChange'
  | 'onMaterialYardsChange'
  | 'onOpenMaterialCategoryChange'
>

export function MaterialFlowFields(props: MaterialFlowFieldsProps) {
  return (
    <>
      <MaterialSelector
        categories={materialCategories}
        openCategoryId={props.openMaterialCategory}
        selectedMaterial={props.materialType}
        onOpenCategoryChange={props.onOpenMaterialCategoryChange}
        onSelectMaterial={props.onMaterialTypeChange}
      />

      {props.materialType === 'Other Material' ? (
        <label className="input-group">
          <span className="input-label">Custom Material</span>
          <input className="input" value={props.customMaterialType} onChange={(event) => props.onCustomMaterialTypeChange(event.target.value)} placeholder="Type your custom material here..." />
        </label>
      ) : null}

      <div className="wizard-step2-two-col">
        <label className="input-group">
          <span className="input-label">Color</span>
          <input className="input" value={props.materialColor} onChange={(event) => props.onMaterialColorChange(event.target.value)} placeholder="e.g. Navy Blue" />
        </label>

        <label className="input-group">
          <span className="input-label">Total Yards</span>
          <input className="input" value={props.materialYards} onChange={(event) => props.onMaterialYardsChange(event.target.value)} placeholder="0" inputMode="decimal" />
        </label>
      </div>

      <div className="input-group">
        <span className="input-label">Material Quality</span>
        <div className="wizard-quality-scroll">
          {qualities.map((quality) => (
            <button key={quality} type="button" className={`pill${props.materialQuality === quality ? ' active' : ''}`} onClick={() => props.onMaterialQualityChange(quality)}>
              {quality}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
