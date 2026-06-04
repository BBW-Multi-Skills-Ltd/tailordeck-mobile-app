import type {
  ExpenseForm,
  MakeCategory,
  MaterialQuality,
  MaterialSource,
  OrderMode,
  PersonForm,
  Reminder,
} from './newJobConfig'

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
  referencePhotoNames: string[]
  expenses: ExpenseForm[]
  totalExpenses: number
  projectedProfit: number
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
  onReminderChange: (value: Reminder) => void
  onDetailsOpenChange: (updater: (previous: boolean) => boolean) => void
}
