import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
  return (
    <div className="stack gap-8">
      <span className="input-label">Material Type</span>
      <p className="text-sm text-muted wizard-helper-inline">Pick a fabric category, then select the exact material used for this job.</p>

      {categories.map((category) => {
        const isOpen = openCategoryId === category.id

        return (
          <article key={category.id} className="card stack gap-8">
            <button
              type="button"
              className="row-between wizard-material-category-btn"
              onClick={() => onOpenCategoryChange(isOpen ? '' : category.id)}
              aria-expanded={isOpen}
            >
              <h5>{category.title}</h5>
              {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  className="stack gap-8 wizard-collapsible"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  {category.options.map((option) => (
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
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        )
      })}
    </div>
  )
}
