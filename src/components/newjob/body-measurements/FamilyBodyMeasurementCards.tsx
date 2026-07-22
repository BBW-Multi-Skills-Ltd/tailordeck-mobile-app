import { Plus } from 'lucide-react'
import { step1FieldsBySex } from '../newJobConfig'
import BodyPersonMeasurementsCard from '../BodyPersonMeasurementsCard'
import type { BodyMeasurementsSectionProps } from './bodyMeasurementsTypes'
import { toMeasurementSex } from './bodyMeasurementSex'

export function FamilyBodyMeasurementCards(props: BodyMeasurementsSectionProps) {
  return (
    <>
      {props.persons.map((person, index) => {
        const adultIndex = props.persons.filter((p, i) => p.role === 'adult' && i <= index).length
        const isPrimaryAdult = person.role === 'adult' && adultIndex === 1
        const canRemovePerson = person.role === 'child' || adultIndex > 2
        const personLabel = isPrimaryAdult ? person.name || props.clientName || 'Client' : person.role === 'adult' ? `Adult ${adultIndex}` : person.name || 'Child'
        const measurementFields = step1FieldsBySex(toMeasurementSex(person.sex))
        const sexOptions = person.role === 'child' ? (['Boy', 'Girl'] as const) : (['Male', 'Female'] as const)

        return (
          <BodyPersonMeasurementsCard
            key={person.id}
            person={person}
            title={personLabel}
            subtitle={`${person.sex} - ${person.role}`}
            isOpen={props.stepOneMeasurementsOpen[person.id] ?? true}
            sexOptions={sexOptions}
            measurementFields={measurementFields}
            measurementTitle={person.role === 'child' ? 'Child Measurements (in)' : 'Body Measurements (in)'}
            itemValue={props.sameItemForAll ? props.itemType : person.itemType}
            itemPlaceholder="e.g. Agbada, Gown, Shirt"
            showItemField={!props.sameItemForAll}
            showNameInput
            namePlaceholder={person.role === 'child' ? 'Child name' : 'Adult name'}
            disableName={isPrimaryAdult}
            showAge={person.role === 'child'}
            allowRemove={canRemovePerson}
            onRemove={() => props.onRemovePerson(person.id)}
            onToggle={() => props.onTogglePersonMeasurements(person.id)}
            onUpdatePerson={(updater) => props.onUpdatePerson(person.id, updater)}
            onUpdateMeasurement={(field, value) => props.onUpdatePersonMeasurement(person.id, field, value)}
            onUpdateDescription={(value) => props.onUpdatePersonDescription(person.id, value)}
            onSharedItemTypeChange={props.sameItemForAll ? props.onSharedItemTypeChange : (value) => props.onUpdatePerson(person.id, (p) => ({ ...p, itemType: value }))}
          />
        )
      })}
      <button type="button" className="wizard-add-person-btn" onClick={props.onAddAdult}>
        <Plus size={22} />
        <span>Add Adult</span>
      </button>
      <button type="button" className="wizard-add-person-btn" onClick={props.onAddChild}>
        <Plus size={22} />
        <span>Add Child</span>
      </button>
    </>
  )
}
