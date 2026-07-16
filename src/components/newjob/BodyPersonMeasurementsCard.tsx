import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Plus, Trash2, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { commonFieldsBySex, labelFromField, type PersonForm, type PersonSex } from './newJobConfig'

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
  showItemField?: boolean
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
  showItemField = true,
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
  const measurementFieldKey = measurementFields.join('|')
  const defaultVisibleFields = useMemo(
    () => commonFieldsBySex(toMeasurementSex(person.sex)).filter((field) => measurementFields.includes(field)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measurementFieldKey, person.sex],
  )
  const [visibleFields, setVisibleFields] = useState<string[]>(defaultVisibleFields)
  const [customFieldName, setCustomFieldName] = useState('')
  const [showAddMeasurements, setShowAddMeasurements] = useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const hiddenFields = measurementFields.filter((field) => !visibleFields.includes(field))

  useEffect(() => {
    setVisibleFields(defaultVisibleFields)
  }, [defaultVisibleFields, person.id])

  function handleItemChange(value: string): void {
    onSharedItemTypeChange(value)
    onUpdatePerson((current) => ({ ...current, itemType: value }))
  }

  function addMeasurementField(field: string): void {
    setVisibleFields((current) => (current.includes(field) ? current : [...current, field]))
  }

  function removeMeasurementField(field: string): void {
    setVisibleFields((current) => current.filter((item) => item !== field))
    setShowAddMeasurements(true)
  }

  function addCustomMeasurement(): void {
    const normalized = customFieldName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    if (!normalized) return
    addMeasurementField(normalized)
    setCustomFieldName('')
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
            <button type="button" className="btn btn-ghost btn-icon wizard-person-remove-btn" onClick={() => setConfirmRemoveOpen(true)} aria-label={`Remove ${title}`}>
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

        {showItemField ? (
          <label className="input-group">
            <span className="input-label">What are you making for this person?</span>
            <input className="input" value={itemValue} onChange={(event) => handleItemChange(event.target.value)} placeholder={itemPlaceholder} list="body-wear-item-options" />
          </label>
        ) : null}

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
          <div className="row-between">
            <p className="text-sm text-muted">{measurementTitle}</p>
            <span className="wizard-measurement-count">{visibleFields.length} fields</span>
          </div>
          <p className="wizard-measurement-helper">Common measurements are shown first. Remove what you do not need, then add more if this job requires it.</p>
          <div className="wizard-measurements-grid">
            {visibleFields.map((field) => (
              <div key={`${person.id}-${field}`} className="input-group wizard-measurement-field">
                <div className="row-between">
                  <span className="input-label">{labelFromField(field)} (in)</span>
                  <button type="button" className="wizard-measure-remove" onClick={() => removeMeasurementField(field)} aria-label={`Remove ${labelFromField(field)}`}>
                    <X size={13} />
                  </button>
                </div>
                <input className="input" value={person.measurements[field] ?? ''} onChange={(event) => onUpdateMeasurement(field, event.target.value)} placeholder="0" inputMode="decimal" />
              </div>
            ))}
          </div>

          {hiddenFields.length ? (
            <div className="wizard-add-measurements">
              <button
                type="button"
                className="wizard-add-measurements-toggle"
                onClick={() => setShowAddMeasurements((current) => !current)}
                aria-expanded={showAddMeasurements}
              >
                <Plus size={13} />
                Add measurement
                <span>{hiddenFields.length} available</span>
              </button>

              {showAddMeasurements ? (
                <div className="stack gap-8">
                  <p className="wizard-add-measurements-title">Restore or add a field</p>
                  <div className="wizard-add-measurements-row">
                    {hiddenFields.map((field) => (
                      <button key={`${person.id}-add-${field}`} type="button" className="wizard-add-measurement-chip" onClick={() => addMeasurementField(field)}>
                        <Plus size={12} />
                        {labelFromField(field)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {showAddMeasurements ? (
            <div className="wizard-custom-measurement">
              <input
                className="input"
                value={customFieldName}
                onChange={(event) => setCustomFieldName(event.target.value)}
                placeholder="Custom measurement name"
              />
              <button type="button" className="btn btn-secondary" onClick={addCustomMeasurement}>
                Add
              </button>
            </div>
          ) : null}
        </div>

        <label className="input-group">
          <span className="input-label">Description (optional)</span>
          <input className="input" value={person.description} onChange={(event) => onUpdateDescription(event.target.value)} placeholder="Any style notes for this person" />
        </label>
      </motion.div>

      <RemovePersonConfirmDialog
        isOpen={confirmRemoveOpen}
        personId={person.id}
        title={title}
        onCancel={() => setConfirmRemoveOpen(false)}
        onConfirm={() => {
          setConfirmRemoveOpen(false)
          onRemove?.()
        }}
      />
    </article>
  )
}

type RemovePersonConfirmDialogProps = {
  isOpen: boolean
  personId: string
  title: string
  onCancel: () => void
  onConfirm: () => void
}

function RemovePersonConfirmDialog({ isOpen, personId, title, onCancel, onConfirm }: RemovePersonConfirmDialogProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="wizard-confirm-overlay"
      role="presentation"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
      }}
    >
      <div
        className="wizard-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`remove-${personId}-title`}
        aria-describedby={`remove-${personId}-desc`}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <p id={`remove-${personId}-title`} className="wizard-confirm-title">Remove {title}?</p>
        <p id={`remove-${personId}-desc`} className="wizard-confirm-copy">This person&apos;s measurements will be removed from this job.</p>
        <div className="wizard-confirm-actions">
          <button
            type="button"
            className="btn btn-secondary flex-1"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onCancel()
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger flex-1"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onConfirm()
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function toMeasurementSex(sex: PersonSex): PersonSex {
  if (sex === 'Girl') return 'Female'
  if (sex === 'Boy') return 'Male'
  return sex
}
