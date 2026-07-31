import { amendmentPartOptions } from './newJobConfig'
import type { StepMaterialPricingProps } from './stepMaterialPricing.types'

type AmendmentMaterialFieldsProps = Pick<
  StepMaterialPricingProps,
  | 'amendmentPartName'
  | 'amendmentPartQuantity'
  | 'fieldErrorKey'
  | 'fieldErrors'
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
          key={`amendment-part-name-${props.fieldErrorKey}`}
          className={`input${props.fieldErrors.amendmentPartName ? ' input-invalid input-shake' : ''}`}
          value={props.amendmentPartName}
          onChange={(event) => {
            props.onAmendmentPartNameChange(event.target.value)
            props.onMaterialTypeChange(event.target.value)
          }}
          placeholder="e.g. Zip, Button, Fabric patch"
          list="amendment-part-options"
          aria-invalid={Boolean(props.fieldErrors.amendmentPartName)}
        />
        {props.fieldErrors.amendmentPartName ? <span className="input-error-text">{props.fieldErrors.amendmentPartName}</span> : null}
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
          <input
            key={`amendment-part-quantity-${props.fieldErrorKey}`}
            className={`input${props.fieldErrors.amendmentPartQuantity ? ' input-invalid input-shake' : ''}`}
            value={props.amendmentPartQuantity}
            onChange={(event) => props.onAmendmentPartQuantityChange(event.target.value)}
            placeholder="0"
            inputMode="numeric"
            aria-invalid={Boolean(props.fieldErrors.amendmentPartQuantity)}
          />
          {props.fieldErrors.amendmentPartQuantity ? <span className="input-error-text">{props.fieldErrors.amendmentPartQuantity}</span> : null}
        </label>
      </div>
    </>
  )
}
