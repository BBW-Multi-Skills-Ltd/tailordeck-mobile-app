import { digitsOnly, numericValue, type ExpenseForm } from './newJobConfig'

export type JobPricingSummary = {
  charge: number
  depositPercentValue: number
  deposit: number
  balance: number
  totalExpenses: number
  projectedProfit: number
}

export function calculateJobPricing(chargeAmount: string, depositPercent: string, expenses: ExpenseForm[]): JobPricingSummary {
  const charge = numericValue(digitsOnly(chargeAmount))
  const depositPercentValue = Math.max(Math.min(numericValue(depositPercent), 100), 0)
  const deposit = Math.round((charge * depositPercentValue) / 100)
  const balance = Math.max(charge - deposit, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + numericValue(digitsOnly(item.cost)), 0)
  const projectedProfit = charge - totalExpenses

  return {
    charge,
    depositPercentValue,
    deposit,
    balance,
    totalExpenses,
    projectedProfit,
  }
}
