import { makeCategories, orderModes, type OrderMode } from './newJobConfig'
import { ItemTypeField, ItemTypeOptions } from './order-setup/ItemTypeField'
import { ChoiceCard, GuidedCardHeader } from './order-setup/OrderSetupPrimitives'
import type { OrderSetupFieldsProps } from './order-setup/orderSetupTypes'
import { OrderScopeField, SameItemToggle } from './order-setup/ScopeFields'

export function OrderSetupFields(props: OrderSetupFieldsProps) {
  return (
    <>
      <section className="wizard-guided-card">
        <GuidedCardHeader step="1" title="What kind of item is this?" copy="Choose the item type first." />
        <div className="wizard-choice-grid">
          {makeCategories.map((category) => (
            <ChoiceCard
              key={category}
              active={props.makeCategory === category}
              title={category}
              description={category === 'Body Wear' ? 'Clothes worn by people' : 'Beddings, caps, covers'}
              onClick={() => props.onMakeCategoryChange(category)}
            />
          ))}
        </div>
      </section>

      <section className="wizard-guided-card wizard-mode-card">
        <div className="wizard-mode-reveal">
          <GuidedCardHeader step="2" title="What do you want to do?" copy="Choose sewing or amendment." />
        </div>
        <div className="wizard-choice-grid wizard-mode-grid">
          {orderModes.map((mode) => (
            <ChoiceCard
              key={mode}
              active={props.orderMode === mode}
              title={getOrderModeLabel(mode)}
              description={mode === 'New Stitch' ? 'Make from start to finish' : 'Fix, resize, or amend'}
              onClick={() => props.onOrderModeChange(mode)}
            />
          ))}
        </div>
      </section>

      <section className="wizard-guided-card">
        <GuidedCardHeader step="3" title="Who is this for?" copy="Choose client count and item." />
        {!(props.showBodyMeasurementFlow && props.jobType === 'Single') ? <ItemTypeField {...props} error={props.fieldErrors.itemType} /> : null}
        {!props.isAmendmentMode ? <OrderScopeField {...props} /> : <p className="wizard-guided-copy">Repair jobs start with one client. You can add notes below.</p>}
        {props.showBodyMeasurementFlow && props.jobType !== 'Single' ? <SameItemToggle {...props} /> : null}
      </section>

      <ItemTypeOptions />
    </>
  )
}

function getOrderModeLabel(mode: OrderMode): string {
  if (mode === 'New Stitch') return 'Sew New Item'
  return 'Repair / Amendment'
}
