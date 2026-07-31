import { CheckCircle2 } from 'lucide-react'
import { materialCategories, qualities } from './newJobConfig'
import { MaterialColorSelector } from './MaterialColorSelector'
import MaterialSelector from './MaterialSelector'
import { MaterialYardSelector } from './MaterialYardSelector'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

type MaterialFlowFieldsProps = Pick<
  StepMaterialPricingProps,
  | 'customMaterialType'
  | 'fieldErrors'
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
  const selectedMaterialOption = materialCategories
    .flatMap((category) => category.options)
    .find((option) => option.name === props.materialType)
  const selectedMaterialLabel = props.materialType === 'Other Material'
    ? props.customMaterialType.trim() || 'Custom Material'
    : props.materialType
  const selectedMaterialDescription = props.materialType === 'Other Material'
    ? 'Custom material selected'
    : selectedMaterialOption?.description
  const hasSelectedMaterial = props.materialType === 'Other Material'
    ? Boolean(props.customMaterialType.trim())
    : Boolean(props.materialType)

  return (
    <>
      <div className="stack gap-8">
        <MaterialSelector
          categories={materialCategories}
          error={props.fieldErrors.materialType}
          openCategoryId={props.openMaterialCategory}
          selectedMaterial={props.materialType}
          onOpenCategoryChange={props.onOpenMaterialCategoryChange}
          onSelectMaterial={props.onMaterialTypeChange}
        />

        {props.materialType === 'Other Material' ? (
          <>
            <input
              className={`input${props.fieldErrors.customMaterialType ? ' input-invalid' : ''}`}
              value={props.customMaterialType}
              onChange={(event) => props.onCustomMaterialTypeChange(event.target.value)}
              placeholder="Type your custom material here..."
              aria-invalid={Boolean(props.fieldErrors.customMaterialType)}
            />
            {props.fieldErrors.customMaterialType ? <span className="input-error-text">{props.fieldErrors.customMaterialType}</span> : null}
          </>
        ) : null}

        {hasSelectedMaterial ? (
          <div className="wizard-selected-material">
            <CheckCircle2 size={16} />
            <div>
              <strong>{selectedMaterialLabel}</strong>
              <p>{selectedMaterialDescription ?? 'Material selected'}</p>
            </div>
          </div>
        ) : null}
      </div>

      <MaterialColorSelector error={props.fieldErrors.materialColor} selectedColor={props.materialColor} onSelectColor={props.onMaterialColorChange} />
      <MaterialYardSelector error={props.fieldErrors.materialYards} selectedYards={props.materialYards} onSelectYards={props.onMaterialYardsChange} />

      <div className="stack gap-8">
        <div className="input-group">
          <span className="input-label">Material Quality</span>
          <p className="text-sm text-muted wizard-helper-inline">What quality is the material?</p>
          <div className="wizard-material-quick-row" aria-label="Material quality">
            {qualities.map((quality) => (
              <button key={quality} type="button" className={`wizard-quality-chip${props.materialQuality === quality ? ' active' : ''}`} onClick={() => props.onMaterialQualityChange(quality)}>
                {quality}
              </button>
            ))}
          </div>
        </div>

        {props.materialQuality ? (
          <div className="wizard-selected-material">
            <CheckCircle2 size={16} />
            <div>
              <strong>{props.materialQuality}</strong>
              <p>Material quality selected</p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
