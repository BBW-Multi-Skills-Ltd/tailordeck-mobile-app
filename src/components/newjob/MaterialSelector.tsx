import { CheckCircle2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { MaterialCategory } from './newJobConfig'

type MaterialSelectorProps = {
  categories: MaterialCategory[]
  openCategoryId: string
  selectedMaterial: string
  onOpenCategoryChange: (categoryId: string) => void
  onSelectMaterial: (materialName: string) => void
}

export default function MaterialSelector({
  categories,
  openCategoryId,
  selectedMaterial,
  onOpenCategoryChange,
  onSelectMaterial,
}: MaterialSelectorProps) {
  const [searchValue, setSearchValue] = useState('')
  const [showBrowse, setShowBrowse] = useState(false)
  const activeCategory = categories.find((category) => category.id === openCategoryId) ?? categories[0]
  const commonMaterials = useMemo(
    () => categories.flatMap((category) => category.options).filter((option) => ['Ankara', 'Lace', 'Guinea Brocade', 'Satin', 'Crepe', 'Other Material'].includes(option.name)),
    [categories],
  )
  const visibleOptions = useMemo(() => {
    const sourceOptions = searchValue.trim()
      ? categories.flatMap((category) => category.options)
      : activeCategory.options
    const query = searchValue.trim().toLowerCase()
    if (!query) return sourceOptions
    return sourceOptions.filter((option) => `${option.name} ${option.description}`.toLowerCase().includes(query))
  }, [activeCategory.options, categories, searchValue])
  const selectedOption = useMemo(
    () => categories.flatMap((category) => category.options).find((option) => option.name === selectedMaterial),
    [categories, selectedMaterial],
  )

  return (
    <div className="stack gap-8">
      <span className="input-label">Material Type</span>
      <p className="text-sm text-muted wizard-helper-inline">Choose from common fabrics first, or search if you need something else.</p>

      <label className="wizard-material-search">
        <Search size={15} />
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search material"
        />
      </label>

      <div className="wizard-material-quick-row" aria-label="Common materials">
        {commonMaterials.map((option) => (
          <button
            key={`quick-${option.name}`}
            type="button"
            className={`wizard-material-quick-chip${selectedMaterial === option.name ? ' active' : ''}`}
            onClick={() => onSelectMaterial(option.name)}
          >
            {option.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="wizard-material-browse-toggle"
        onClick={() => setShowBrowse((current) => !current)}
        aria-expanded={showBrowse}
      >
        Browse all material categories
        <span>{categories.length} groups</span>
      </button>

      {showBrowse || searchValue.trim() ? (
        <div className="stack gap-8">
          {!searchValue.trim() ? (
            <div className="wizard-material-category-row" aria-label="Material categories">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`wizard-material-category-chip${activeCategory.id === category.id ? ' active' : ''}`}
                  onClick={() => onOpenCategoryChange(category.id)}
                >
                  {category.title.replace(' Materials', '')}
                </button>
              ))}
            </div>
          ) : null}

          <article className="wizard-material-options-panel">
            <div className="row-between">
              <h5>{searchValue.trim() ? 'Search results' : activeCategory.title}</h5>
              <span>{visibleOptions.length}</span>
            </div>

            {visibleOptions.length ? (
              <div className="stack gap-8">
                {visibleOptions.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={`wizard-material-option${selectedMaterial === option.name ? ' active' : ''}`}
                    onClick={() => onSelectMaterial(option.name)}
                  >
                    <span className="wizard-material-title">{option.name}</span>
                    <span className="wizard-material-description">{option.description}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="wizard-material-empty">
                <strong>No material found</strong>
                <p>Select Other Material and type the fabric name yourself.</p>
                <button type="button" className="wizard-add-measurement-chip" onClick={() => onSelectMaterial('Other Material')}>
                  Use Other Material
                </button>
              </div>
            )}
          </article>
        </div>
      ) : null}

      {selectedMaterial ? (
        <div className="wizard-selected-material">
          <CheckCircle2 size={16} />
          <div>
            <strong>{selectedMaterial}</strong>
            <p>{selectedOption?.description ?? 'Custom material selected. Add the exact name below.'}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
