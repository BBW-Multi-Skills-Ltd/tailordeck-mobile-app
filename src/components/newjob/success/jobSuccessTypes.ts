import type { ExpenseForm, JobType, MakeCategory, OrderMode, Reminder, ReminderUnit } from '../newJobConfig'

export type JobSuccessViewProps = {
  createdJobId: string
  clientName: string
  clientPhone: string
  color: string
  customReminderValue: string
  customReminderUnit: ReminderUnit
  deadlineTime: string
  deposit: number
  effectiveItemType: string
  expenses: ExpenseForm[]
  jobType: string
  makeCategory: MakeCategory
  materialQuality: string
  materialSource: string
  materialType: string
  orderMode: OrderMode
  reminder: Reminder
  scopeLabel: JobType | string
  charge: number
  deadlineDate: string
  totalYard: string
  onViewJobDetails: () => void
}
