import { useState } from 'react'
import type { ExpenseForm } from './newJobConfig'

export function useNewJobCostingState() {
  const [chargeAmount, setChargeAmount] = useState('')
  const [depositPercent, setDepositPercent] = useState('')
  const [expenses, setExpenses] = useState<ExpenseForm[]>([])
  const [expenseDraftName, setExpenseDraftName] = useState('')
  const [expenseDraftCost, setExpenseDraftCost] = useState('')
  const [worthIt, setWorthIt] = useState<'Yes' | 'No'>('Yes')

  return {
    chargeAmount,
    depositPercent,
    expenseDraftCost,
    expenseDraftName,
    expenses,
    setChargeAmount,
    setDepositPercent,
    setExpenseDraftCost,
    setExpenseDraftName,
    setExpenses,
    setWorthIt,
    worthIt,
  }
}
