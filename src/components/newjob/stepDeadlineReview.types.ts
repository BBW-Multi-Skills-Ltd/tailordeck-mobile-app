import type {
  ExpenseForm,
  JobType,
  MakeCategory,
  MaterialQuality,
  MaterialSource,
  OrderMode,
  PersonForm,
  Reminder,
} from './newJobConfig'
import type { NewJobFieldErrors } from './newJobFieldValidation'

export type StepDeadlineReviewProps = {
  reviewMode: boolean
  detailsOpen: boolean
  draftSaved: boolean
  balance: number
  reminder: Reminder
  deadlineDate: string
  deadlineTime: string
  clientName: string
  clientPhone: string
  jobType: JobType
  orderMode: OrderMode
  makeCategory: MakeCategory
  scopeLabel: string
  sameItemForAll: boolean
  effectiveItemType: string
  persons: PersonForm[]
  selectedNonBodyFields: string[]
  isAmendmentMode: boolean
  nonBodyDescription: string
  amendmentIssueType: string
  amendmentArea: string
  amendmentTarget: string
  amendmentDescription: string
  selectedMaterialValue: string
  materialColor: string
  materialYards: string
  materialQuality: MaterialQuality
  materialSource: MaterialSource
  charge: number
  deposit: number
  referencePhotoFilesByTarget: Record<string, File[]>
  referencePhotoNames: string[]
  referencePhotoNamesByTarget: Record<string, string[]>
  fieldErrorKey: number
  fieldErrors: NewJobFieldErrors
  expenses: ExpenseForm[]
  totalExpenses: number
  projectedProfit: number
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
  onReferencePhotoUpload: (targetId: string, files: FileList | null, maxFiles: number) => void
  onReminderChange: (value: Reminder) => void
  onDetailsOpenChange: (updater: (previous: boolean) => boolean) => void
}
