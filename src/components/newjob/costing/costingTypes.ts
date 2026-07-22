import type { ExpenseForm } from '../newJobConfig'
import type { PricingDepositFieldsProps } from '../PricingDepositFields'

export type StepCostingProps = PricingDepositFieldsProps & {
  expenseDraftName: string
  expenseDraftCost: string
  expenses: ExpenseForm[]
  charge: number
  totalExpenses: number
  projectedProfit: number
  worthIt: 'Yes' | 'No'
  onExpenseDraftNameChange: (value: string) => void
  onExpenseDraftCostChange: (value: string) => void
  onAddExpense: () => void
  onRemoveExpense: (expenseId: string) => void
  onWorthItChange: (value: 'Yes' | 'No') => void
}
