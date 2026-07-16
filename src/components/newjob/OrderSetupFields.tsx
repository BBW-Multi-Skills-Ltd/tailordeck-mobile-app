import {
  type MakeCategory,
  type OrderMode,
  makeCategories,
  nonBodyItems,
  orderModes,
  scopeForBodyWear,
  scopeForNonBody,
  bodyWearItems,
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
      <section className="wizard-guided-card">
        <div className="wizard-guided-title-row">
          <span className="wizard-guided-step">1</span>
          <div>
            <p className="wizard-guided-title">What kind of work is this?</p>
            <p className="wizard-guided-copy">Start broad. TailorDeck will show the right measurement flow.</p>
          </div>
        </div>

        <div className="wizard-choice-grid">
          {makeCategories.map((category) => (
            <ChoiceCard
              key={category}
              active={props.makeCategory === category}
              title={category}
              description={category === 'Body Wear' ? 'Clothes worn by a person' : 'Beddings, caps, covers, and more'}
              onClick={() => props.onMakeCategoryChange(category)}
            />
          ))}
        </div>

        <div className="wizard-choice-grid">
          {orderModes.map((mode) => (
            <ChoiceCard
              key={mode}
              active={props.orderMode === mode}
              title={mode}
              description={mode === 'New Stitch' ? 'Fresh job from material to finish' : 'Fix, resize, replace, or adjust'}
              onClick={() => props.onOrderModeChange(mode)}
            />
          ))}
        </div>
      </section>

      <section className="wizard-guided-card">
        <div className="wizard-guided-title-row">
          <span className="wizard-guided-step">2</span>
          <div>
            <p className="wizard-guided-title">Job details</p>
            <p className="wizard-guided-copy">Tell us who this job is for and what you are making.</p>
          </div>
        </div>

        {!(props.showBodyMeasurementFlow && props.jobType === 'Single') ? <ItemTypeField {...props} /> : null}
        {!props.isAmendmentMode ? <OrderScopeField {...props} /> : <p className="wizard-guided-copy">Repair jobs start with one client. You can add notes below.</p>}
        {props.showBodyMeasurementFlow && props.jobType !== 'Single' ? <SameItemToggle {...props} /> : null}
      </section>

      <ItemTypeOptions />
    </>
  )
}

function ChoiceCard({
  active,
  description,
  onClick,
  title,
}: {
  active: boolean
  description: string
  onClick: () => void
  title: MakeCategory | OrderMode
}) {
  return (
    <button type="button" className={`wizard-choice-card${active ? ' active' : ''}`} onClick={onClick}>
      <span className="wizard-choice-title">{title}</span>
      <span className="wizard-choice-copy">{description}</span>
    </button>
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
