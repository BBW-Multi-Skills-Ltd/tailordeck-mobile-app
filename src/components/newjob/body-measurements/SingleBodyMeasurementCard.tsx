import { step1FieldsBySex } from '../newJobConfig'
import BodyPersonMeasurementsCard from '../BodyPersonMeasurementsCard'
import type { BodyMeasurementsSectionProps } from './bodyMeasurementsTypes'

export function SingleBodyMeasurementCard(props: BodyMeasurementsSectionProps) {
  const person = props.persons[0]
  if (!person) return null

  return (
    <BodyPersonMeasurementsCard
      person={person}
      title={person.name || props.clientName || 'Client'}
      subtitle={`${person.sex} - adult`}
      isOpen={props.singleMeasurementsOpen}
      sexOptions={['Male', 'Female']}
      measurementFields={step1FieldsBySex(person.sex)}
      measurementTitle="Body Measurements (in)"
      itemValue={person.itemType || props.itemType}
      itemError={props.itemTypeError}
      itemPlaceholder="e.g. Shirt, Gown, Agbada"
      onToggle={() => props.onSingleMeasurementsOpenChange((prev) => !prev)}
      onUpdatePerson={(updater) => props.onUpdatePerson(person.id, updater)}
      onUpdateMeasurement={(field, value) => props.onUpdatePersonMeasurement(person.id, field, value)}
      onUpdateDescription={(value) => props.onUpdatePersonDescription(person.id, value)}
      onSharedItemTypeChange={props.onSharedItemTypeChange}
    />
  )
}
