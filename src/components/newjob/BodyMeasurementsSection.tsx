import { Plus } from 'lucide-react'
import { step1FieldsBySex, type JobType, type PersonForm, type PersonSex } from './newJobConfig'
import BodyPersonMeasurementsCard from './BodyPersonMeasurementsCard'

type BodyMeasurementsSectionProps = {
  clientName: string
  itemType: string
  jobType: JobType
  persons: PersonForm[]
  sameItemForAll: boolean
  singleMeasurementsOpen: boolean
  stepOneMeasurementsOpen: Record<string, boolean>
  onAddAdult: () => void
  onAddChild: () => void
  onRemovePerson: (personId: string) => void
  onSharedItemTypeChange: (value: string) => void
  onSingleMeasurementsOpenChange: (updater: (previous: boolean) => boolean) => void
  onTogglePersonMeasurements: (personId: string) => void
  onUpdatePerson: (personId: string, updater: (person: PersonForm) => PersonForm) => void
  onUpdatePersonDescription: (personId: string, value: string) => void
  onUpdatePersonMeasurement: (personId: string, field: string, value: string) => void
}

export default function BodyMeasurementsSection({
  clientName,
  itemType,
  jobType,
  persons,
  sameItemForAll,
  singleMeasurementsOpen,
  stepOneMeasurementsOpen,
  onAddAdult,
  onAddChild,
  onRemovePerson,
  onSharedItemTypeChange,
  onSingleMeasurementsOpenChange,
  onTogglePersonMeasurements,
  onUpdatePerson,
  onUpdatePersonDescription,
  onUpdatePersonMeasurement,
}: BodyMeasurementsSectionProps) {
  if (jobType === 'Single' && persons[0]) {
    return (
      <div className="stack gap-8 wizard-step1-measurements">
        <MeasurementSectionIntro />
        <BodyPersonMeasurementsCard
          person={persons[0]}
          title={persons[0].name || clientName || 'Client'}
          subtitle={`${persons[0].sex} - adult`}
          isOpen={singleMeasurementsOpen}
          sexOptions={['Male', 'Female']}
          measurementFields={step1FieldsBySex(persons[0].sex)}
          measurementTitle="Body Measurements (in)"
          itemValue={persons[0].itemType || itemType}
          itemPlaceholder="e.g. Shirt, Gown, Agbada"
          onToggle={() => onSingleMeasurementsOpenChange((prev) => !prev)}
          onUpdatePerson={(updater) => onUpdatePerson(persons[0].id, updater)}
          onUpdateMeasurement={(field, value) => onUpdatePersonMeasurement(persons[0].id, field, value)}
          onUpdateDescription={(value) => onUpdatePersonDescription(persons[0].id, value)}
          onSharedItemTypeChange={onSharedItemTypeChange}
        />
      </div>
    )
  }

  if (jobType === 'Couple') {
    return (
      <div className="stack gap-8 wizard-step1-measurements">
        <MeasurementSectionIntro />
        {persons.slice(0, 2).map((person, index) => (
          <BodyPersonMeasurementsCard
            key={person.id}
            person={person}
            title={index === 0 ? person.name || clientName || 'Client' : `Person ${index + 1}`}
            subtitle={`${person.sex} - adult`}
            isOpen={stepOneMeasurementsOpen[person.id] ?? true}
            sexOptions={['Male', 'Female']}
            measurementFields={step1FieldsBySex(person.sex)}
            measurementTitle="Body Measurements (in)"
            itemValue={sameItemForAll ? itemType : person.itemType}
            itemPlaceholder="e.g. Suit, Gown, Kaftan"
            showItemField={!sameItemForAll}
            showNameInput
            namePlaceholder={`Person ${index + 1} name`}
            disableName={index === 0}
            onToggle={() => onTogglePersonMeasurements(person.id)}
            onUpdatePerson={(updater) => onUpdatePerson(person.id, updater)}
            onUpdateMeasurement={(field, value) => onUpdatePersonMeasurement(person.id, field, value)}
            onUpdateDescription={(value) => onUpdatePersonDescription(person.id, value)}
            onSharedItemTypeChange={sameItemForAll ? onSharedItemTypeChange : (value) => onUpdatePerson(person.id, (p) => ({ ...p, itemType: value }))}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="stack gap-8 wizard-step1-measurements">
      <MeasurementSectionIntro />
      {persons.map((person, index) => {
        const adultIndex = persons.filter((p, i) => p.role === 'adult' && i <= index).length
        const isPrimaryAdult = person.role === 'adult' && adultIndex === 1
        const canRemovePerson = person.role === 'child' || adultIndex > 2
        const personLabel = isPrimaryAdult ? person.name || clientName || 'Client' : person.role === 'adult' ? `Adult ${adultIndex}` : person.name || 'Child'
        const measurementFields = step1FieldsBySex(toMeasurementSex(person.sex))
        const sexOptions = person.role === 'child' ? (['Boy', 'Girl'] as const) : (['Male', 'Female'] as const)

        return (
          <BodyPersonMeasurementsCard
            key={person.id}
            person={person}
            title={personLabel}
            subtitle={`${person.sex} - ${person.role}`}
            isOpen={stepOneMeasurementsOpen[person.id] ?? true}
            sexOptions={sexOptions}
            measurementFields={measurementFields}
            measurementTitle={person.role === 'child' ? 'Child Measurements (in)' : 'Body Measurements (in)'}
            itemValue={sameItemForAll ? itemType : person.itemType}
            itemPlaceholder="e.g. Agbada, Gown, Shirt"
            showItemField={!sameItemForAll}
            showNameInput
            namePlaceholder={person.role === 'child' ? 'Child name' : 'Adult name'}
            disableName={isPrimaryAdult}
            showAge={person.role === 'child'}
            allowRemove={canRemovePerson}
            onRemove={() => onRemovePerson(person.id)}
            onToggle={() => onTogglePersonMeasurements(person.id)}
            onUpdatePerson={(updater) => onUpdatePerson(person.id, updater)}
            onUpdateMeasurement={(field, value) => onUpdatePersonMeasurement(person.id, field, value)}
            onUpdateDescription={(value) => onUpdatePersonDescription(person.id, value)}
            onSharedItemTypeChange={sameItemForAll ? onSharedItemTypeChange : (value) => onUpdatePerson(person.id, (p) => ({ ...p, itemType: value }))}
          />
        )
      })}

      <button type="button" className="wizard-add-person-btn" onClick={onAddAdult}>
        <Plus size={22} />
        <span>Add Adult</span>
      </button>

      <button type="button" className="wizard-add-person-btn" onClick={onAddChild}>
        <Plus size={22} />
        <span>Add Child</span>
      </button>
    </div>
  )
}

function toMeasurementSex(sex: PersonSex): PersonSex {
  if (sex === 'Girl') return 'Female'
  if (sex === 'Boy') return 'Male'
  return sex
}

function MeasurementSectionIntro() {
  return (
    <div className="wizard-measurement-intro">
      <p className="input-label">Measurements</p>
      <p>Fill only needed fields. Add or remove measurements.</p>
    </div>
  )
}
