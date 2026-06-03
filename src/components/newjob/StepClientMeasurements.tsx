import {
  bodyWearItems,
  makeCategories,
  nonBodyItems,
  orderModes,
  scopeForBodyWear,
  scopeForNonBody,
  type JobType,
  type MakeCategory,
  type OrderMode,
  type PersonForm,
} from './newJobConfig'
import AmendmentDetailsForm from './AmendmentDetailsForm'
import BodyMeasurementsSection from './BodyMeasurementsSection'
import NonBodyMeasurementsForm from './NonBodyMeasurementsForm'

type StepClientMeasurementsProps = {
  repeatClient: boolean
  clientName: string
  clientPhone: string
  makeCategory: MakeCategory
  orderMode: OrderMode
  itemType: string
  jobType: JobType
  sameItemForAll: boolean
  showBodyMeasurementFlow: boolean
  showNonBodyMeasurementFlow: boolean
  isAmendmentMode: boolean
  persons: PersonForm[]
  singleMeasurementsOpen: boolean
  stepOneMeasurementsOpen: Record<string, boolean>
  selectedNonBodyFields: string[]
  nonBodyMeasurements: Record<string, string>
  nonBodyQuantity: string
  nonBodyDescription: string
  amendmentIssueType: string
  amendmentArea: string
  amendmentTarget: string
  amendmentDescription: string
  onClientNameChange: (value: string) => void
  onClientPhoneChange: (value: string) => void
  onMakeCategoryChange: (value: MakeCategory) => void
  onOrderModeChange: (value: OrderMode) => void
  onSharedItemTypeChange: (value: string) => void
  onJobTypeChange: (value: JobType) => void
  onSameItemToggle: (enabled: boolean) => void
  onSingleMeasurementsOpenChange: (updater: (previous: boolean) => boolean) => void
  onTogglePersonMeasurements: (personId: string) => void
  onUpdatePerson: (personId: string, updater: (person: PersonForm) => PersonForm) => void
  onUpdatePersonMeasurement: (personId: string, field: string, value: string) => void
  onUpdatePersonDescription: (personId: string, value: string) => void
  onRemovePerson: (personId: string) => void
  onAddAdult: () => void
  onAddChild: () => void
  onNonBodyQuantityChange: (value: string) => void
  onNonBodyMeasurementChange: (field: string, value: string) => void
  onNonBodyDescriptionChange: (value: string) => void
  onAmendmentIssueTypeChange: (value: string) => void
  onAmendmentAreaChange: (value: string) => void
  onAmendmentTargetChange: (value: string) => void
  onAmendmentDescriptionChange: (value: string) => void
}

export default function StepClientMeasurements({
  repeatClient,
  clientName,
  clientPhone,
  makeCategory,
  orderMode,
  itemType,
  jobType,
  sameItemForAll,
  showBodyMeasurementFlow,
  showNonBodyMeasurementFlow,
  isAmendmentMode,
  persons,
  singleMeasurementsOpen,
  stepOneMeasurementsOpen,
  selectedNonBodyFields,
  nonBodyMeasurements,
  nonBodyQuantity,
  nonBodyDescription,
  amendmentIssueType,
  amendmentArea,
  amendmentTarget,
  amendmentDescription,
  onClientNameChange,
  onClientPhoneChange,
  onMakeCategoryChange,
  onOrderModeChange,
  onSharedItemTypeChange,
  onJobTypeChange,
  onSameItemToggle,
  onSingleMeasurementsOpenChange,
  onTogglePersonMeasurements,
  onUpdatePerson,
  onUpdatePersonMeasurement,
  onUpdatePersonDescription,
  onRemovePerson,
  onAddAdult,
  onAddChild,
  onNonBodyQuantityChange,
  onNonBodyMeasurementChange,
  onNonBodyDescriptionChange,
  onAmendmentIssueTypeChange,
  onAmendmentAreaChange,
  onAmendmentTargetChange,
  onAmendmentDescriptionChange,
}: StepClientMeasurementsProps) {
  return (
    <div className="stack gap-12">
      <label className="input-group">
        <span className="input-label">Client Full Name *</span>
        <input className="input" value={clientName} onChange={(event) => onClientNameChange(event.target.value)} placeholder="e.g. Amina Bello" autoFocus readOnly={repeatClient} />
      </label>

      <label className="input-group">
        <span className="input-label">Phone / WhatsApp *</span>
        <input className="input" value={clientPhone} onChange={(event) => onClientPhoneChange(event.target.value)} placeholder="e.g. 08012345678" inputMode="tel" readOnly={repeatClient} />
      </label>

      {repeatClient ? (
        <article className="card stack gap-6 wizard-repeat-client-note">
          <p className="text-sm font-semibold">Existing client selected</p>
          <p className="text-sm text-muted">Client details and latest measurements are prefilled. Edit measurements here only if this new job needs updated values.</p>
        </article>
      ) : null}

      <div className="input-group">
        <span className="input-label">What type of order is this?</span>
        <div className="wizard-sex-group">
          {makeCategories.map((category) => (
            <button key={category} type="button" className={`pill wizard-jobtype-pill${makeCategory === category ? ' active' : ''}`} onClick={() => onMakeCategoryChange(category)}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <span className="input-label">Order Mode</span>
        <div className="wizard-sex-group">
          {orderModes.map((mode) => (
            <button key={mode} type="button" className={`pill wizard-jobtype-pill${orderMode === mode ? ' active' : ''}`} onClick={() => onOrderModeChange(mode)}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {!(showBodyMeasurementFlow && jobType === 'Single') ? (
        <label className="input-group">
          <span className="input-label">What are you making?</span>
          <input
            className="input"
            value={itemType}
            onChange={(event) => onSharedItemTypeChange(event.target.value)}
            placeholder={makeCategory === 'Body Wear' ? 'e.g. Wedding gown, Shirt, Agbada' : 'e.g. Bedcover, Pillow case, Face cap'}
            list={makeCategory === 'Body Wear' ? 'body-wear-item-options' : 'non-body-item-options'}
          />
        </label>
      ) : null}

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

      {!isAmendmentMode ? (
        <div className="input-group">
          <span className="input-label">Order Scope</span>
          <div className="wizard-jobtype-group">
            {(makeCategory === 'Body Wear' ? scopeForBodyWear : scopeForNonBody).map((type) => (
              <button key={type} type="button" className={`pill wizard-jobtype-pill${jobType === type ? ' active' : ''}`} onClick={() => onJobTypeChange(type)}>
                {type}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showBodyMeasurementFlow && jobType !== 'Single' ? (
        <div className="input-group">
          <span className="input-label">Use same item for everyone?</span>
          <div className="wizard-sex-group">
            <button type="button" className={`pill wizard-jobtype-pill${sameItemForAll ? ' active' : ''}`} onClick={() => onSameItemToggle(true)}>
              Same Item
            </button>
            <button type="button" className={`pill wizard-jobtype-pill${!sameItemForAll ? ' active' : ''}`} onClick={() => onSameItemToggle(false)}>
              Different Items
            </button>
          </div>
        </div>
      ) : null}

      {showBodyMeasurementFlow ? (
        <BodyMeasurementsSection
          clientName={clientName}
          itemType={itemType}
          jobType={jobType}
          persons={persons}
          sameItemForAll={sameItemForAll}
          singleMeasurementsOpen={singleMeasurementsOpen}
          stepOneMeasurementsOpen={stepOneMeasurementsOpen}
          onAddAdult={onAddAdult}
          onAddChild={onAddChild}
          onRemovePerson={onRemovePerson}
          onSharedItemTypeChange={onSharedItemTypeChange}
          onSingleMeasurementsOpenChange={onSingleMeasurementsOpenChange}
          onTogglePersonMeasurements={onTogglePersonMeasurements}
          onUpdatePerson={onUpdatePerson}
          onUpdatePersonDescription={onUpdatePersonDescription}
          onUpdatePersonMeasurement={onUpdatePersonMeasurement}
        />
      ) : null}

      {showNonBodyMeasurementFlow ? (
        <NonBodyMeasurementsForm
          quantity={nonBodyQuantity}
          fields={selectedNonBodyFields}
          measurements={nonBodyMeasurements}
          description={nonBodyDescription}
          onQuantityChange={onNonBodyQuantityChange}
          onMeasurementChange={onNonBodyMeasurementChange}
          onDescriptionChange={onNonBodyDescriptionChange}
        />
      ) : null}

      {isAmendmentMode ? (
        <AmendmentDetailsForm
          issueType={amendmentIssueType}
          area={amendmentArea}
          target={amendmentTarget}
          description={amendmentDescription}
          onIssueTypeChange={onAmendmentIssueTypeChange}
          onAreaChange={onAmendmentAreaChange}
          onTargetChange={onAmendmentTargetChange}
          onDescriptionChange={onAmendmentDescriptionChange}
        />
      ) : null}
    </div>
  )
}
