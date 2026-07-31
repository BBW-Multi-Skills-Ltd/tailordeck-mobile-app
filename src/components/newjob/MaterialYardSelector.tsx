import { ArrowRight, CheckCircle2, Plus } from 'lucide-react'
import { useState } from 'react'
import { commonMaterialYards, materialYardCategories } from './materialYardOptions'

type MaterialYardSelectorProps = {
  error?: string
  selectedYards: string
  onSelectYards: (value: string) => void
}

export function MaterialYardSelector({ error, selectedYards, onSelectYards }: MaterialYardSelectorProps) {
  const [openCategoryId, setOpenCategoryId] = useState('standard')
  const [showBrowse, setShowBrowse] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const activeCategory = materialYardCategories.find((category) => category.id === openCategoryId) ?? materialYardCategories[0]
  const visibleOptions = activeCategory.options

  return (
    <div className="stack gap-8">
      <span className="input-label">Total Yards</span>
      <p className="text-sm text-muted wizard-helper-inline">How many yards are needed?</p>

      <div className="wizard-material-quick-row" aria-label="Common yards">
        {commonMaterialYards.map((yards) => (
          <button
            key={`quick-yards-${yards}`}
            type="button"
            className={`wizard-yard-chip${selectedYards === yards ? ' active' : ''}`}
            onClick={() => {
              setShowCustom(false)
              onSelectYards(yards)
            }}
          >
            {yards} yd
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`wizard-material-browse-toggle${error ? ' input-invalid' : ''}`}
        onClick={() => setShowBrowse((current) => !current)}
        aria-expanded={showBrowse}
        aria-invalid={Boolean(error)}
      >
        Browse yard categories
        <span>{materialYardCategories.length} groups</span>
      </button>

      {showBrowse ? (
        <div className="stack gap-8">
          <div className="wizard-material-category-row" aria-label="Yard categories">
            {materialYardCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`wizard-material-category-chip${activeCategory.id === category.id ? ' active' : ''}`}
                onClick={() => setOpenCategoryId(category.id)}
              >
                {category.title.replace(' Jobs', '')}
              </button>
            ))}
          </div>

          <article className="wizard-material-options-panel">
            <div className="row-between">
              <h5>{activeCategory.title}</h5>
              <span className="wizard-swipe-hint">Swipe for more <ArrowRight size={12} /></span>
            </div>
            <div className="wizard-yard-option-grid wizard-swipe-option-grid">
              <button
                type="button"
                className={`wizard-yard-option wizard-custom-option${showCustom ? ' active' : ''}`}
                onClick={() => setShowCustom((current) => !current)}
              >
                <span className="wizard-custom-option-icon">
                  <Plus size={14} />
                </span>
                <span>
                  <strong>Add Custom</strong>
                  <small>Type yards</small>
                </span>
              </button>
              {visibleOptions.map((yards) => (
                <button
                  key={`${activeCategory.id}-${yards}`}
                  type="button"
                  className={`wizard-yard-option${selectedYards === yards ? ' active' : ''}`}
                  onClick={() => {
                    setShowCustom(false)
                    onSelectYards(yards)
                  }}
                >
                  <strong>{yards}</strong>
                  <span>yards</span>
                </button>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {showCustom ? (
        <input
          className={`input${error ? ' input-invalid' : ''}`}
          value={selectedYards}
          onChange={(event) => onSelectYards(event.target.value)}
          placeholder="Type yard amount"
          inputMode="decimal"
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {error ? <span className="input-error-text">{error}</span> : null}

      {selectedYards ? (
        <div className="wizard-selected-material">
          <CheckCircle2 size={16} />
          <div>
            <strong>{selectedYards} yards</strong>
            <p>Yard amount selected</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
