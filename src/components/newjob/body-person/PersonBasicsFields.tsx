import { bodyWearItems, type PersonForm, type PersonSex } from '../newJobConfig'
import { ItemTypeChooser } from '../order-setup/ItemTypeField'

export function PersonBasicsFields({
  disableName,
  itemPlaceholder,
  itemError,
  itemErrorKey = 0,
  itemValue,
  namePlaceholder,
  onItemChange,
  onUpdatePerson,
  person,
  sexOptions,
  showAge,
  showItemField,
  showNameInput,
}: {
  person: PersonForm
  sexOptions: readonly PersonSex[]
  itemValue: string
  itemPlaceholder: string
  itemError?: string
  itemErrorKey?: number
  showNameInput: boolean
  showItemField: boolean
  namePlaceholder: string
  disableName: boolean
  showAge: boolean
  onItemChange: (value: string) => void
  onUpdatePerson: (updater: (person: PersonForm) => PersonForm) => void
}) {
  return (
    <>
      {showNameInput ? (
        <label className="input-group">
          <span className="input-label">Name</span>
          <input className="input" value={person.name} onChange={(event) => onUpdatePerson((current) => ({ ...current, name: event.target.value }))} placeholder={namePlaceholder} disabled={disableName} />
        </label>
      ) : null}

      {showItemField ? (
        <ItemTypeChooser
          customPlaceholder={itemPlaceholder}
          error={itemError}
          errorKey={itemErrorKey}
          itemType={itemValue}
          label="What are you making for this person?"
          options={bodyWearItems}
          onItemTypeChange={onItemChange}
        />
      ) : null}

      <div className="input-group">
        <span className="input-label">Sex</span>
        <div className="wizard-sex-group">
          {sexOptions.map((sex) => (
            <button
              key={sex}
              type="button"
              className={`pill wizard-jobtype-pill${person.sex === sex ? ' active' : ''}`}
              onClick={() => onUpdatePerson((current) => ({ ...current, sex, role: sex === 'Boy' || sex === 'Girl' ? 'child' : 'adult' }))}
            >
              {sex}
            </button>
          ))}
        </div>
      </div>

      {showAge ? (
        <label className="input-group">
          <span className="input-label">Age</span>
          <input className="input" value={person.age} onChange={(event) => onUpdatePerson((current) => ({ ...current, age: event.target.value }))} placeholder="Child age" inputMode="numeric" />
        </label>
      ) : null}
    </>
  )
}
