import type { Dispatch, SetStateAction } from 'react'
import { digitsOnly, type ExpenseForm } from './newJobConfig'

type CostingActionParams = {
  expenseDraftCost: string
  expenseDraftName: string
  setExpenseDraftCost: (value: string) => void
  setExpenseDraftName: (value: string) => void
  setExpenses: Dispatch<SetStateAction<ExpenseForm[]>>
}

export function createCostingActions({
  expenseDraftCost,
  expenseDraftName,
  setExpenseDraftCost,
  setExpenseDraftName,
  setExpenses,
}: CostingActionParams) {
  function addExpense(): void {
    const cleanName = expenseDraftName.trim()
    const cleanCost = digitsOnly(expenseDraftCost)
    if (!cleanName && !cleanCost) return

    setExpenses((prev) => [
      ...prev,
      { id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: cleanName || 'Expense', cost: cleanCost || '0' },
    ])
    setExpenseDraftName('')
    setExpenseDraftCost('')
  }

  function removeExpense(expenseId: string): void {
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId))
  }

  return {
    addExpense,
    removeExpense,
  }
}
