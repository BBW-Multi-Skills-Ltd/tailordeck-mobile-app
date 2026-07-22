import type { JobType, MakeCategory, PersonForm, Reminder } from '../newJobConfig'

export type DeadlineFieldsProps = {
  balance: number
  clientName: string
  deadlineDate: string
  deadlineTime: string
  effectiveItemType: string
  jobType: JobType
  makeCategory: MakeCategory
  persons: PersonForm[]
  referencePhotoNamesByTarget: Record<string, string[]>
  reminder: Reminder
  sameItemForAll: boolean
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
  onReferencePhotoUpload: (targetId: string, files: FileList | null, maxFiles: number) => void
  onReminderChange: (value: Reminder) => void
}
