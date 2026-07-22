import type { JobType, PersonForm } from '../newJobConfig'

export type BodyMeasurementsSectionProps = {
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
