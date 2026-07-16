import { CheckCircle2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { commonMaterialYards, materialYardCategories } from './materialYardOptions'

type MaterialYardSelectorProps = {
  selectedYards: string
  onSelectYards: (value: string) => void
}

export function MaterialYardSelector({ selectedYards, onSelectYards }: MaterialYardSelectorProps) {
  const [searchValue, setSearchValue] = useState('')
  const [openCategoryId, setOpenCategoryId] = useState('standard')
  const [showBrowse, setShowBrowse] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const activeCategory = materialYardCategories.find((category) => category.id === openCategoryId) ?? materialYardCategories[0]
  const allYards = useMemo(() => materialYardCategories.flatMap((category) => category.options), [])
  const visibleOptions = useMemo(() => {
    const query = searchValue.trim()
    const source = query ? allYards : activeCategory.options
    if (!query) return source
    return source.filter((yards) => yards.includes(query))
  }, [activeCategory.options, allYards, searchValue])

  return (
    <div className="stack gap-8">
      <span className="input-label">Total Yards</span>
      <p className="text-sm text-muted wizard-helper-inline">How many yards are needed?</p>

      <label className="wizard-material-search">
        <Search size={15} />
        <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search yards" inputMode="decimal" />
      </label>

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

      <button type="button" className="wizard-material-browse-toggle" onClick={() => setShowBrowse((current) => !current)} aria-expanded={showBrowse}>
        Browse yard categories
        <span>{materialYardCategories.length} groups</span>
      </button>

      {showBrowse || searchValue.trim() ? (
        <div className="stack gap-8">
          {!searchValue.trim() ? (
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
          ) : null}

          <article className="wizard-material-options-panel">
            <div className="row-between">
              <h5>{searchValue.trim() ? 'Search results' : activeCategory.title}</h5>
              <span>{visibleOptions.length}</span>
            </div>
            <div className="wizard-yard-option-grid">
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

      <button type="button" className="wizard-add-measurement-chip" onClick={() => setShowCustom((current) => !current)}>
        Use custom yards
      </button>

      {showCustom ? (
        <input className="input" value={selectedYards} onChange={(event) => onSelectYards(event.target.value)} placeholder="Type yard amount" inputMode="decimal" />
      ) : null}

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
