import type { JobType, MakeCategory, PersonForm, Reminder, ReminderSelection, ReminderUnit } from '../newJobConfig'
import type { NewJobFieldErrors } from '../newJobFieldValidation'

export type DeadlineFieldsProps = {
  balance: number
  clientName: string
  deadlineDate: string
  deadlineTime: string
  effectiveItemType: string
  jobType: JobType
  makeCategory: MakeCategory
  persons: PersonForm[]
  referencePhotoFilesByTarget: Record<string, File[]>
  referencePhotoNamesByTarget: Record<string, string[]>
  fieldErrorKey: number
  fieldErrors: NewJobFieldErrors
  reminder: ReminderSelection
  customReminderValue: string
  customReminderUnit: ReminderUnit
  sameItemForAll: boolean
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
  onReferencePhotoUpload: (targetId: string, files: FileList | null, maxFiles: number) => void
  onReminderChange: (value: Reminder) => void
  onCustomReminderValueChange: (value: string) => void
  onCustomReminderUnitChange: (value: ReminderUnit) => void
}
