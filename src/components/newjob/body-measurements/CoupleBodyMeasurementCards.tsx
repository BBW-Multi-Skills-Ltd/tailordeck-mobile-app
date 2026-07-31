import { step1FieldsBySex } from '../newJobConfig'
import BodyPersonMeasurementsCard from '../BodyPersonMeasurementsCard'
import type { BodyMeasurementsSectionProps } from './bodyMeasurementsTypes'

export function CoupleBodyMeasurementCards(props: BodyMeasurementsSectionProps) {
  return (
    <>
      {props.persons.slice(0, 2).map((person, index) => (
        <BodyPersonMeasurementsCard
          key={person.id}
          person={person}
          title={index === 0 ? person.name || props.clientName || 'Client' : `Person ${index + 1}`}
          subtitle={`${person.sex} - adult`}
          isOpen={props.stepOneMeasurementsOpen[person.id] ?? true}
          sexOptions={['Male', 'Female']}
          measurementFields={step1FieldsBySex(person.sex)}
          measurementTitle="Body Measurements (in)"
          itemValue={props.sameItemForAll ? props.itemType : person.itemType}
          itemError={props.sameItemForAll || index > 0 ? undefined : props.itemTypeError}
          itemErrorKey={props.fieldErrorKey}
          itemPlaceholder="e.g. Suit, Gown, Kaftan"
          showItemField={!props.sameItemForAll}
          showNameInput
          namePlaceholder={`Person ${index + 1} name`}
          disableName={index === 0}
          onToggle={() => props.onTogglePersonMeasurements(person.id)}
          onUpdatePerson={(updater) => props.onUpdatePerson(person.id, updater)}
          onUpdateMeasurement={(field, value) => props.onUpdatePersonMeasurement(person.id, field, value)}
          onUpdateDescription={(value) => props.onUpdatePersonDescription(person.id, value)}
          onSharedItemTypeChange={props.sameItemForAll ? props.onSharedItemTypeChange : (value) => props.onUpdatePerson(person.id, (p) => ({ ...p, itemType: value }))}
        />
      ))}
    </>
  )
}
