import { Plus } from 'lucide-react'
import {
  CHILD_FIELDS,
  bodyWearItems,
  makeCategories,
  nonBodyItems,
  orderModes,
  scopeForBodyWear,
  scopeForNonBody,
  step1FieldsBySex,
  type JobType,
  type MakeCategory,
  type OrderMode,
  type PersonForm,
} from './newJobConfig'
import AmendmentDetailsForm from './AmendmentDetailsForm'
import BodyPersonMeasurementsCard from './BodyPersonMeasurementsCard'
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

      {showBodyMeasurementFlow && jobType === 'Single' && persons[0] ? (
        <div className="stack gap-8 wizard-step1-measurements">
          <p className="input-label">Measurements</p>
          <BodyPersonMeasurementsCard
            person={persons[0]}
            title={persons[0].name || clientName || 'Client'}
            subtitle={`${persons[0].sex} - adult`}
            isOpen={singleMeasurementsOpen}
            sexOptions={['Male', 'Female']}
            measurementFields={step1FieldsBySex(persons[0].sex)}
            measurementTitle="Body Measurements (cm)"
            itemValue={persons[0].itemType || itemType}
            itemPlaceholder="e.g. Shirt, Gown, Agbada"
            onToggle={() => onSingleMeasurementsOpenChange((prev) => !prev)}
            onUpdatePerson={(updater) => onUpdatePerson(persons[0].id, updater)}
            onUpdateMeasurement={(field, value) => onUpdatePersonMeasurement(persons[0].id, field, value)}
            onUpdateDescription={(value) => onUpdatePersonDescription(persons[0].id, value)}
            onSharedItemTypeChange={onSharedItemTypeChange}
          />
        </div>
      ) : null}

      {showBodyMeasurementFlow && jobType === 'Couple' ? (
        <div className="stack gap-8 wizard-step1-measurements">
          <p className="input-label">Measurements</p>
          {persons.slice(0, 2).map((person, index) => (
            <BodyPersonMeasurementsCard
              key={person.id}
              person={person}
              title={index === 0 ? person.name || clientName || 'Client' : `Person ${index + 1}`}
              subtitle={`${person.sex} - adult`}
              isOpen={stepOneMeasurementsOpen[person.id] ?? true}
              sexOptions={['Male', 'Female']}
              measurementFields={step1FieldsBySex(person.sex)}
              measurementTitle="Body Measurements (cm)"
              itemValue={sameItemForAll ? itemType : person.itemType}
              itemPlaceholder="e.g. Suit, Gown, Kaftan"
              showNameInput
              namePlaceholder={`Person ${index + 1} name`}
              disableName={index === 0}
              onToggle={() => onTogglePersonMeasurements(person.id)}
              onUpdatePerson={(updater) => onUpdatePerson(person.id, updater)}
              onUpdateMeasurement={(field, value) => onUpdatePersonMeasurement(person.id, field, value)}
              onUpdateDescription={(value) => onUpdatePersonDescription(person.id, value)}
              onSharedItemTypeChange={sameItemForAll ? onSharedItemTypeChange : (value) => onUpdatePerson(person.id, (p) => ({ ...p, itemType: value }))}
            />
          ))}
        </div>
      ) : null}

      {showBodyMeasurementFlow && jobType === 'Family' ? (
        <div className="stack gap-8 wizard-step1-measurements">
          <p className="input-label">Measurements</p>
          {persons.map((person, index) => {
            const adultIndex = persons.filter((p, i) => p.role === 'adult' && i <= index).length
            const isPrimaryAdult = person.role === 'adult' && adultIndex === 1
            const personLabel = isPrimaryAdult ? person.name || clientName || 'Client' : person.role === 'adult' ? `Adult ${adultIndex}` : person.name || 'Child'
            const measurementFields = person.role === 'child' ? CHILD_FIELDS : step1FieldsBySex(person.sex)
            const sexOptions = person.role === 'child' ? (['Boy', 'Girl'] as const) : (['Male', 'Female'] as const)

            return (
              <BodyPersonMeasurementsCard
                key={person.id}
                person={person}
                title={personLabel}
                subtitle={`${person.sex} - ${person.role}`}
                isOpen={stepOneMeasurementsOpen[person.id] ?? true}
                sexOptions={sexOptions}
                measurementFields={measurementFields}
                measurementTitle={person.role === 'child' ? 'Child Measurements (cm)' : 'Body Measurements (cm)'}
                itemValue={sameItemForAll ? itemType : person.itemType}
                itemPlaceholder="e.g. Agbada, Gown, Shirt"
                showNameInput
                namePlaceholder={person.role === 'child' ? 'Child name' : 'Adult name'}
                disableName={isPrimaryAdult}
                showAge={person.role === 'child'}
                allowRemove={person.role === 'child'}
                onRemove={() => onRemovePerson(person.id)}
                onToggle={() => onTogglePersonMeasurements(person.id)}
                onUpdatePerson={(updater) => onUpdatePerson(person.id, updater)}
                onUpdateMeasurement={(field, value) => onUpdatePersonMeasurement(person.id, field, value)}
                onUpdateDescription={(value) => onUpdatePersonDescription(person.id, value)}
                onSharedItemTypeChange={sameItemForAll ? onSharedItemTypeChange : (value) => onUpdatePerson(person.id, (p) => ({ ...p, itemType: value }))}
              />
            )
          })}

          <button type="button" className="wizard-add-person-btn" onClick={onAddAdult}>
            <Plus size={22} />
            <span>Add Adult</span>
          </button>

          <button type="button" className="wizard-add-person-btn" onClick={onAddChild}>
            <Plus size={22} />
            <span>Add Child</span>
          </button>
        </div>
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
