import { bodyWearItems, nonBodyItems } from '../newJobConfig'

export function ItemTypeField({
  error,
  errorKey = 0,
  itemType,
  makeCategory,
  onSharedItemTypeChange,
}: {
  error?: string
  errorKey?: number
  itemType: string
  makeCategory: 'Body Wear' | 'Non-Body Item'
  onSharedItemTypeChange: (value: string) => void
}) {
  return (
    <label className="input-group">
      <span className="input-label">What are you making?</span>
      <input
        key={`item-type-${errorKey}`}
        className={`input${error ? ' input-invalid input-shake' : ''}`}
        value={itemType}
        onChange={(event) => onSharedItemTypeChange(event.target.value)}
        placeholder={makeCategory === 'Body Wear' ? 'e.g. Wedding gown, Shirt, Agbada' : 'e.g. Bedcover, Pillow case, Face cap'}
        list={makeCategory === 'Body Wear' ? 'body-wear-item-options' : 'non-body-item-options'}
        aria-invalid={Boolean(error)}
      />
      {error ? <span className="input-error-text">{error}</span> : null}
    </label>
  )
}

export function ItemTypeOptions() {
  return (
    <>
      <datalist id="body-wear-item-options">
        {bodyWearItems.map((item) => <option key={item} value={item} />)}
      </datalist>
      <datalist id="non-body-item-options">
        {nonBodyItems.map((item) => <option key={item} value={item} />)}
      </datalist>
    </>
  )
}
