import { ArrowRight, Plus } from 'lucide-react'
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
  const [showBrowse, setShowBrowse] = useState(false)
  const browseCategories = useMemo(() => categories.filter((category) => category.id !== 'others'), [categories])
  const activeCategory = browseCategories.find((category) => category.id === openCategoryId) ?? browseCategories[0]
  const commonMaterials = useMemo(
    () => categories.flatMap((category) => category.options).filter((option) => ['Ankara', 'Lace', 'Guinea Brocade', 'Satin', 'Crepe'].includes(option.name)),
    [categories],
  )
  const visibleOptions = useMemo(() => {
    return activeCategory.options.filter((option) => option.name !== 'Other Material')
  }, [activeCategory.options])

  return (
    <div className="stack gap-8">
      <span className="input-label">Material Type</span>
      <p className="text-sm text-muted wizard-helper-inline">Pick a fabric or add yours.</p>

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
        <span>{browseCategories.length} groups</span>
      </button>

      {showBrowse ? (
        <div className="stack gap-8">
          <div className="wizard-material-category-row" aria-label="Material categories">
            {browseCategories.map((category) => (
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

          <article className="wizard-material-options-panel">
            <div className="row-between">
              <h5>{activeCategory.title}</h5>
              <span className="wizard-swipe-hint">Swipe for more <ArrowRight size={12} /></span>
            </div>

            <div className="wizard-material-option-grid wizard-material-paged-grid">
              <button
                type="button"
                className={`wizard-material-option wizard-material-custom-option${selectedMaterial === 'Other Material' ? ' active' : ''}`}
                onClick={() => onSelectMaterial('Other Material')}
              >
                <span className="wizard-material-custom-icon">
                  <Plus size={14} />
                </span>
                <span className="wizard-material-title">Add Custom</span>
                <span className="wizard-material-description">Type your own material name.</span>
              </button>
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
          </article>
        </div>
      ) : null}

    </div>
  )
}
