import { CheckCircle2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { commonMaterialColors, materialColorCategories } from './materialColorOptions'

type MaterialColorSelectorProps = {
  selectedColor: string
  onSelectColor: (value: string) => void
}

export function MaterialColorSelector({ selectedColor, onSelectColor }: MaterialColorSelectorProps) {
  const [searchValue, setSearchValue] = useState('')
  const [openCategoryId, setOpenCategoryId] = useState('neutral')
  const [showBrowse, setShowBrowse] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const activeCategory = materialColorCategories.find((category) => category.id === openCategoryId) ?? materialColorCategories[0]
  const allColors = useMemo(() => materialColorCategories.flatMap((category) => category.options), [])
  const selectedOption = allColors.find((option) => option.name === selectedColor)
  const visibleOptions = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    const source = query ? allColors : activeCategory.options
    if (!query) return source
    return source.filter((option) => `${option.name} ${option.hex}`.toLowerCase().includes(query))
  }, [activeCategory.options, allColors, searchValue])

  return (
    <div className="stack gap-8">
      <span className="input-label">Color</span>
      <p className="text-sm text-muted wizard-helper-inline">What color is the material?</p>

      <label className="wizard-material-search">
        <Search size={15} />
        <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search colors" />
      </label>

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

      <button type="button" className="wizard-material-browse-toggle" onClick={() => setShowBrowse((current) => !current)} aria-expanded={showBrowse}>
        Browse all color categories
        <span>{materialColorCategories.length} groups</span>
      </button>

      {showBrowse || searchValue.trim() ? (
        <div className="stack gap-8">
          {!searchValue.trim() ? (
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
          ) : null}

          <article className="wizard-material-options-panel">
            <div className="row-between">
              <h5>{searchValue.trim() ? 'Search results' : activeCategory.title}</h5>
              <span>{visibleOptions.length}</span>
            </div>
            <div className="wizard-color-option-grid">
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

      <button type="button" className="wizard-add-measurement-chip" onClick={() => setShowCustom((current) => !current)}>
        Use custom color
      </button>

      {showCustom ? (
        <input className="input" value={selectedColor} onChange={(event) => onSelectColor(event.target.value)} placeholder="Type color name or hex code" />
      ) : null}

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
