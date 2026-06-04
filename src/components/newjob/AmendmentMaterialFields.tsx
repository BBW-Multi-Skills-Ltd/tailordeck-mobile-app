import { amendmentPartOptions } from './newJobConfig'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

type AmendmentMaterialFieldsProps = Pick<
  StepMaterialPricingProps,
  | 'amendmentPartName'
  | 'amendmentPartQuantity'
  | 'materialColor'
  | 'onAmendmentPartNameChange'
  | 'onAmendmentPartQuantityChange'
  | 'onMaterialColorChange'
  | 'onMaterialTypeChange'
>

export function AmendmentMaterialFields(props: AmendmentMaterialFieldsProps) {
  return (
    <>
      <label className="input-group">
        <span className="input-label">Material / Part Needed</span>
        <input
          className="input"
          value={props.amendmentPartName}
          onChange={(event) => {
            props.onAmendmentPartNameChange(event.target.value)
            props.onMaterialTypeChange(event.target.value)
          }}
          placeholder="e.g. Zip, Button, Fabric patch"
          list="amendment-part-options"
        />
        <datalist id="amendment-part-options">
          {amendmentPartOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </label>

      <div className="wizard-step2-two-col">
        <label className="input-group">
          <span className="input-label">Color (optional)</span>
          <input className="input" value={props.materialColor} onChange={(event) => props.onMaterialColorChange(event.target.value)} placeholder="e.g. Black" />
        </label>

        <label className="input-group">
          <span className="input-label">Part Quantity</span>
          <input className="input" value={props.amendmentPartQuantity} onChange={(event) => props.onAmendmentPartQuantityChange(event.target.value)} placeholder="0" inputMode="numeric" />
        </label>
      </div>
    </>
  )
}
