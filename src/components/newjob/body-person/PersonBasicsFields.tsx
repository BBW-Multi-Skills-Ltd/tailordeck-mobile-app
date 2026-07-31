import type { PersonForm, PersonSex } from '../newJobConfig'

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
        <label className="input-group">
          <span className="input-label">What are you making for this person?</span>
          <input
            key={`person-item-${person.id}-${itemErrorKey}`}
            className={`input${itemError ? ' input-invalid input-shake' : ''}`}
            value={itemValue}
            onChange={(event) => onItemChange(event.target.value)}
            placeholder={itemPlaceholder}
            list="body-wear-item-options"
            aria-invalid={Boolean(itemError)}
          />
          {itemError ? <span className="input-error-text">{itemError}</span> : null}
        </label>
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
