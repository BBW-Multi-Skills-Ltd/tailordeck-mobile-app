import { ArrowRight, CheckCircle2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { commonMaterialColors, materialColorCategories } from './materialColorOptions'

type MaterialColorSelectorProps = {
  error?: string
  errorKey?: number
  selectedColor: string
  onSelectColor: (value: string) => void
}

export function MaterialColorSelector({ error, errorKey = 0, selectedColor, onSelectColor }: MaterialColorSelectorProps) {
  const [openCategoryId, setOpenCategoryId] = useState('neutral')
  const [showBrowse, setShowBrowse] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const activeCategory = materialColorCategories.find((category) => category.id === openCategoryId) ?? materialColorCategories[0]
  const allColors = useMemo(() => materialColorCategories.flatMap((category) => category.options), [])
  const selectedOption = allColors.find((option) => option.name === selectedColor)
  const visibleOptions = activeCategory.options

  return (
    <div className="stack gap-8">
      <span className="input-label">Color</span>
      <p className="text-sm text-muted wizard-helper-inline">What color is the material?</p>

      <div className="wizard-material-quick-row" aria-label="Common colors">
        {commonMaterialColors.map((option) => (
          <button
            key={option.name}
            type="button"
            className={`wizard-color-chip${selectedColor === option.name ? ' active' : ''}`}
            onClick={() => {
              setShowCustom(false)
              onSelectColor(option.name)
            }}
          >
            <span className="wizard-color-swatch" style={{ backgroundColor: option.hex }} />
            {option.name}
          </button>
        ))}
      </div>

      <button
        key={`color-browse-${errorKey}`}
        type="button"
        className={`wizard-material-browse-toggle${error ? ' input-invalid input-shake' : ''}`}
        onClick={() => setShowBrowse((current) => !current)}
        aria-expanded={showBrowse}
        aria-invalid={Boolean(error)}
      >
        Browse all color categories
        <span>{materialColorCategories.length} groups</span>
      </button>

      {showBrowse ? (
        <div className="stack gap-8">
          <div className="wizard-material-category-row" aria-label="Color categories">
            {materialColorCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`wizard-material-category-chip${activeCategory.id === category.id ? ' active' : ''}`}
                onClick={() => setOpenCategoryId(category.id)}
              >
                {category.title.replace(' Colors', '')}
              </button>
            ))}
          </div>

          <article className="wizard-material-options-panel">
            <div className="row-between">
              <h5>{activeCategory.title}</h5>
              <span className="wizard-swipe-hint">Swipe for more <ArrowRight size={12} /></span>
            </div>
            <div className="wizard-color-option-grid wizard-swipe-option-grid">
              <button
                type="button"
                className={`wizard-color-option wizard-custom-option${showCustom ? ' active' : ''}`}
                onClick={() => setShowCustom((current) => !current)}
              >
                <span className="wizard-custom-option-icon">
                  <Plus size={14} />
                </span>
                <span>
                  <strong>Add Custom</strong>
                  <small>Type name or hex</small>
                </span>
              </button>
              {visibleOptions.map((option) => (
                <button
                  key={`${activeCategory.id}-${option.name}`}
                  type="button"
                  className={`wizard-color-option${selectedColor === option.name ? ' active' : ''}`}
                  onClick={() => {
                    setShowCustom(false)
                    onSelectColor(option.name)
                  }}
                >
                  <span className="wizard-color-swatch" style={{ backgroundColor: option.hex }} />
                  <span>
                    <strong>{option.name}</strong>
                    <small>{option.hex}</small>
                  </span>
                </button>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {showCustom ? (
        <input key={`color-custom-${errorKey}`} className={`input${error ? ' input-invalid input-shake' : ''}`} value={selectedColor} onChange={(event) => onSelectColor(event.target.value)} placeholder="Type color name or hex code" />
      ) : null}

      {error ? <span className="input-error-text">{error}</span> : null}

      {selectedColor ? (
        <div className="wizard-selected-material">
          <CheckCircle2 size={16} />
          <div>
            <strong>{selectedColor}</strong>
            <p>{selectedOption?.hex ?? 'Custom color selected'}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
