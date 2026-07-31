import type { PersonForm, PersonSex } from '../newJobConfig'

export type BodyPersonMeasurementsCardProps = {
  person: PersonForm
  title: string
  subtitle: string
  isOpen: boolean
  sexOptions: readonly PersonSex[]
  measurementFields: string[]
  measurementTitle: string
  itemValue: string
  itemError?: string
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
