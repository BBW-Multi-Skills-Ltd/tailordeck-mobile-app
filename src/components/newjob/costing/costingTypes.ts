import type { ExpenseForm } from '../newJobConfig'
import type { NewJobFieldErrors } from '../newJobFieldValidation'
import type { PricingDepositFieldsProps } from '../PricingDepositFields'

export type StepCostingProps = PricingDepositFieldsProps & {
  expenseDraftName: string
  expenseDraftCost: string
  expenses: ExpenseForm[]
  charge: number
  totalExpenses: number
  projectedProfit: number
  worthIt: 'Yes' | 'No'
  fieldErrorKey: number
  fieldErrors: NewJobFieldErrors
  onExpenseDraftNameChange: (value: string) => void
  onExpenseDraftCostChange: (value: string) => void
  onAddExpense: () => void
  onRemoveExpense: (expenseId: string) => void
  onWorthItChange: (value: 'Yes' | 'No') => void
}
