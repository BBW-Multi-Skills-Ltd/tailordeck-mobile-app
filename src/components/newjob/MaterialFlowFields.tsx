import { materialCategories, qualities } from './newJobConfig'
import { MaterialColorSelector } from './MaterialColorSelector'
import MaterialSelector from './MaterialSelector'
import { MaterialYardSelector } from './MaterialYardSelector'
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

      <MaterialColorSelector selectedColor={props.materialColor} onSelectColor={props.onMaterialColorChange} />
      <MaterialYardSelector selectedYards={props.materialYards} onSelectYards={props.onMaterialYardsChange} />

      <div className="input-group">
        <span className="input-label">Material Quality</span>
        <p className="text-sm text-muted wizard-helper-inline">What quality is the material?</p>
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
