import {
  bodyWearItems,
  makeCategories,
  nonBodyItems,
  orderModes,
  scopeForBodyWear,
  scopeForNonBody,
} from './newJobConfig'
import type { StepClientMeasurementsProps } from './stepClientMeasurements.types'

type OrderSetupFieldsProps = Pick<
  StepClientMeasurementsProps,
  | 'isAmendmentMode'
  | 'itemType'
  | 'jobType'
  | 'makeCategory'
  | 'orderMode'
  | 'sameItemForAll'
  | 'showBodyMeasurementFlow'
  | 'onJobTypeChange'
  | 'onMakeCategoryChange'
  | 'onOrderModeChange'
  | 'onSameItemToggle'
  | 'onSharedItemTypeChange'
>

export function OrderSetupFields(props: OrderSetupFieldsProps) {
  return (
    <>
      <div className="input-group">
        <span className="input-label">What type of order is this?</span>
        <div className="wizard-sex-group">
          {makeCategories.map((category) => (
            <button key={category} type="button" className={`pill wizard-jobtype-pill${props.makeCategory === category ? ' active' : ''}`} onClick={() => props.onMakeCategoryChange(category)}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <span className="input-label">Order Mode</span>
        <div className="wizard-sex-group">
          {orderModes.map((mode) => (
            <button key={mode} type="button" className={`pill wizard-jobtype-pill${props.orderMode === mode ? ' active' : ''}`} onClick={() => props.onOrderModeChange(mode)}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {!(props.showBodyMeasurementFlow && props.jobType === 'Single') ? <ItemTypeField {...props} /> : null}
      <ItemTypeOptions />
      {!props.isAmendmentMode ? <OrderScopeField {...props} /> : null}
      {props.showBodyMeasurementFlow && props.jobType !== 'Single' ? <SameItemToggle {...props} /> : null}
    </>
  )
}

function ItemTypeField(props: OrderSetupFieldsProps) {
  return (
    <label className="input-group">
      <span className="input-label">What are you making?</span>
      <input
        className="input"
        value={props.itemType}
        onChange={(event) => props.onSharedItemTypeChange(event.target.value)}
        placeholder={props.makeCategory === 'Body Wear' ? 'e.g. Wedding gown, Shirt, Agbada' : 'e.g. Bedcover, Pillow case, Face cap'}
        list={props.makeCategory === 'Body Wear' ? 'body-wear-item-options' : 'non-body-item-options'}
      />
    </label>
  )
}

function ItemTypeOptions() {
  return (
    <>
      <datalist id="body-wear-item-options">
        {bodyWearItems.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <datalist id="non-body-item-options">
        {nonBodyItems.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </>
  )
}

function OrderScopeField(props: OrderSetupFieldsProps) {
  return (
    <div className="input-group">
      <span className="input-label">Order Scope</span>
      <div className="wizard-jobtype-group">
        {(props.makeCategory === 'Body Wear' ? scopeForBodyWear : scopeForNonBody).map((type) => (
          <button key={type} type="button" className={`pill wizard-jobtype-pill${props.jobType === type ? ' active' : ''}`} onClick={() => props.onJobTypeChange(type)}>
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}

function SameItemToggle(props: OrderSetupFieldsProps) {
  return (
    <div className="input-group">
      <span className="input-label">Use same item for everyone?</span>
      <div className="wizard-sex-group">
        <button type="button" className={`pill wizard-jobtype-pill${props.sameItemForAll ? ' active' : ''}`} onClick={() => props.onSameItemToggle(true)}>
          Same Item
        </button>
        <button type="button" className={`pill wizard-jobtype-pill${!props.sameItemForAll ? ' active' : ''}`} onClick={() => props.onSameItemToggle(false)}>
          Different Items
        </button>
      </div>
    </div>
  )
}
