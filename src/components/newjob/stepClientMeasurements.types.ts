import type { JobType, MakeCategory, OrderMode, PersonForm } from './newJobConfig'
import type { NewJobFieldErrors } from './newJobFieldValidation'

export type StepClientMeasurementsProps = {
  repeatClient: boolean
  clientName: string
  clientPhone: string
  makeCategory: MakeCategory
  orderMode: OrderMode
  itemType: string
  jobType: JobType
  sameItemForAll: boolean
  showBodyMeasurementFlow: boolean
  showNonBodyMeasurementFlow: boolean
  isAmendmentMode: boolean
  persons: PersonForm[]
  singleMeasurementsOpen: boolean
  stepOneMeasurementsOpen: Record<string, boolean>
  selectedNonBodyFields: string[]
  nonBodyMeasurements: Record<string, string>
  nonBodyQuantity: string
  nonBodyDescription: string
  amendmentIssueType: string
  amendmentArea: string
  amendmentTarget: string
  amendmentDescription: string
  fieldErrorKey: number
  fieldErrors: NewJobFieldErrors
  onClientNameChange: (value: string) => void
  onClientPhoneChange: (value: string) => void
  onMakeCategoryChange: (value: MakeCategory) => void
  onOrderModeChange: (value: OrderMode) => void
  onSharedItemTypeChange: (value: string) => void
  onJobTypeChange: (value: JobType) => void
  onSameItemToggle: (enabled: boolean) => void
  onSingleMeasurementsOpenChange: (updater: (previous: boolean) => boolean) => void
  onTogglePersonMeasurements: (personId: string) => void
  onUpdatePerson: (personId: string, updater: (person: PersonForm) => PersonForm) => void
  onUpdatePersonMeasurement: (personId: string, field: string, value: string) => void
  onUpdatePersonDescription: (personId: string, value: string) => void
  onRemovePerson: (personId: string) => void
  onAddAdult: () => void
  onAddChild: () => void
  onNonBodyQuantityChange: (value: string) => void
  onNonBodyMeasurementChange: (field: string, value: string) => void
  onNonBodyDescriptionChange: (value: string) => void
  onAmendmentIssueTypeChange: (value: string) => void
  onAmendmentAreaChange: (value: string) => void
  onAmendmentTargetChange: (value: string) => void
  onAmendmentDescriptionChange: (value: string) => void
}
