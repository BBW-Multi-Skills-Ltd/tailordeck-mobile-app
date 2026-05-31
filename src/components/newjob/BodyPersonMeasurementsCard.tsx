import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2, UserRound } from 'lucide-react'
import { labelFromField, type PersonForm, type PersonSex } from './newJobConfig'

type BodyPersonMeasurementsCardProps = {
  person: PersonForm
  title: string
  subtitle: string
  isOpen: boolean
  sexOptions: readonly PersonSex[]
  measurementFields: string[]
  measurementTitle: string
  itemValue: string
  itemPlaceholder: string
  showNameInput?: boolean
  namePlaceholder?: string
  disableName?: boolean
  showAge?: boolean
  allowRemove?: boolean
  onToggle: () => void
  onRemove?: () => void
  onUpdatePerson: (updater: (person: PersonForm) => PersonForm) => void
  onUpdateMeasurement: (field: string, value: string) => void
  onUpdateDescription: (value: string) => void
  onSharedItemTypeChange: (value: string) => void
}

export default function BodyPersonMeasurementsCard({
  person,
  title,
  subtitle,
  isOpen,
  sexOptions,
  measurementFields,
  measurementTitle,
  itemValue,
  itemPlaceholder,
  showNameInput = false,
  namePlaceholder = 'Person name',
  disableName = false,
  showAge = false,
  allowRemove = false,
  onToggle,
  onRemove,
  onUpdatePerson,
  onUpdateMeasurement,
  onUpdateDescription,
  onSharedItemTypeChange,
}: BodyPersonMeasurementsCardProps) {
  function handleItemChange(value: string): void {
    onSharedItemTypeChange(value)
    onUpdatePerson((current) => ({ ...current, itemType: value }))
  }

  return (
    <article className="card stack gap-12">
      <div className="row-between">
        <button type="button" className="row gap-8 wizard-person-toggle flex-1" onClick={onToggle} aria-expanded={isOpen}>
          <div className="wizard-person-icon center">
            <UserRound size={14} />
          </div>
          <div className="stack gap-4 text-left">
            <h5>{title}</h5>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
        </button>

        <div className="row gap-8">
          {allowRemove ? (
            <button type="button" className="btn btn-ghost btn-icon" onClick={onRemove} aria-label="Remove person">
              <Trash2 size={15} />
            </button>
          ) : null}
          <button type="button" className="btn btn-ghost btn-icon" onClick={onToggle} aria-label={isOpen ? 'Collapse measurements' : 'Expand measurements'} aria-expanded={isOpen}>
            {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
          </button>
        </div>
      </div>

      <motion.div
        className="stack gap-12 wizard-collapsible"
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{
          height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.2, ease: 'easeOut' },
        }}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {showNameInput ? (
          <label className="input-group">
            <span className="input-label">Name</span>
            <input className="input" value={person.name} onChange={(event) => onUpdatePerson((current) => ({ ...current, name: event.target.value }))} placeholder={namePlaceholder} disabled={disableName} />
          </label>
        ) : null}

        <label className="input-group">
          <span className="input-label">What are you making for this person?</span>
          <input className="input" value={itemValue} onChange={(event) => handleItemChange(event.target.value)} placeholder={itemPlaceholder} list="body-wear-item-options" />
        </label>

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

        <div className="stack gap-8">
          <p className="text-sm text-muted">{measurementTitle}</p>
          <div className="wizard-measurements-grid">
            {measurementFields.map((field) => (
              <label key={`${person.id}-${field}`} className="input-group">
                <span className="input-label">{labelFromField(field)} (cm)</span>
                <input className="input" value={person.measurements[field] ?? ''} onChange={(event) => onUpdateMeasurement(field, event.target.value)} placeholder="0" inputMode="decimal" />
              </label>
            ))}
          </div>
        </div>

        <label className="input-group">
          <span className="input-label">Description (optional)</span>
          <input className="input" value={person.description} onChange={(event) => onUpdateDescription(event.target.value)} placeholder="Any style notes for this person" />
        </label>
      </motion.div>
    </article>
  )
}
