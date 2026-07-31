import { motion } from 'framer-motion'
import { useState } from 'react'
import { PersonBasicsFields } from './body-person/PersonBasicsFields'
import { MeasurementFieldsEditor } from './body-person/MeasurementFieldsEditor'
import { PersonCardHeader } from './body-person/PersonCardHeader'
import { RemovePersonConfirmDialog } from './body-person/RemovePersonConfirmDialog'
import type { BodyPersonMeasurementsCardProps } from './body-person/bodyPersonTypes'
import { useVisibleMeasurementFields } from './body-person/useVisibleMeasurementFields'

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
  itemError,
  itemErrorKey = 0,
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
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const measurementState = useVisibleMeasurementFields({ measurementFields, person })

  function handleItemChange(value: string): void {
    onSharedItemTypeChange(value)
    onUpdatePerson((current) => ({ ...current, itemType: value }))
  }

  return (
    <article className="card stack gap-12">
      <PersonCardHeader
        allowRemove={allowRemove}
        isOpen={isOpen}
        onRemoveClick={() => setConfirmRemoveOpen(true)}
        onToggle={onToggle}
        subtitle={subtitle}
        title={title}
      />

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
        <PersonBasicsFields
          disableName={disableName}
          itemPlaceholder={itemPlaceholder}
          itemError={itemError}
          itemErrorKey={itemErrorKey}
          itemValue={itemValue}
          namePlaceholder={namePlaceholder}
          onItemChange={handleItemChange}
          onUpdatePerson={onUpdatePerson}
          person={person}
          sexOptions={sexOptions}
          showAge={showAge}
          showItemField={showItemField}
          showNameInput={showNameInput}
        />
        <MeasurementFieldsEditor
          {...measurementState}
          measurementTitle={measurementTitle}
          onUpdateMeasurement={onUpdateMeasurement}
          person={person}
        />
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
