import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { bodyWearItems, nonBodyItems, type MakeCategory } from '../newJobConfig'

const customValue = '__custom__'

type ItemTypeChooserProps = {
  customPlaceholder: string
  error?: string
  errorKey?: number
  itemType: string
  label: string
  options: readonly string[]
  onItemTypeChange: (value: string) => void
}

function resolveSelectedValue(itemType: string, options: readonly string[]): string {
  if (!itemType) return ''
  return options.includes(itemType) ? itemType : customValue
}

export function ItemTypeChooser({
  customPlaceholder,
  error,
  errorKey = 0,
  itemType,
  label,
  options,
  onItemTypeChange,
}: ItemTypeChooserProps) {
  const [customOpen, setCustomOpen] = useState(false)
  const selectedValue = resolveSelectedValue(itemType, options)
  const showCustomInput = customOpen || selectedValue === customValue
  const selectValue = customOpen ? customValue : selectedValue

  return (
    <div className="input-group">
      <span className="input-label">{label}</span>
      <div className="wizard-select-input-wrap">
        <select
          key={`item-type-select-${errorKey}`}
          className={`input wizard-select-input${error ? ' input-invalid input-shake' : ''}`}
          value={selectValue}
          onChange={(event) => {
            const nextValue = event.target.value
            if (nextValue === customValue) {
              setCustomOpen(true)
              if (options.includes(itemType)) onItemTypeChange('')
              return
            }
            setCustomOpen(false)
            onItemTypeChange(nextValue)
          }}
          aria-invalid={Boolean(error)}
        >
          <option value="">Choose item</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value={customValue}>Other / custom item</option>
        </select>
        <ChevronDown size={18} className="wizard-select-chevron" />
      </div>

      {showCustomInput ? (
        <input
          className={`input${error ? ' input-invalid input-shake' : ''}`}
          value={itemType}
          onChange={(event) => onItemTypeChange(event.target.value)}
          placeholder={customPlaceholder}
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {error ? <span className="input-error-text">{error}</span> : null}
    </div>
  )
}

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
  makeCategory: MakeCategory
  onSharedItemTypeChange: (value: string) => void
}) {
  const options = makeCategory === 'Body Wear' ? bodyWearItems : nonBodyItems

  return (
    <ItemTypeChooser
      customPlaceholder={makeCategory === 'Body Wear' ? 'Type custom clothing item' : 'Type custom item'}
      error={error}
      errorKey={errorKey}
      itemType={itemType}
      label="What are you making?"
      options={options}
      onItemTypeChange={onSharedItemTypeChange}
    />
  )
}
