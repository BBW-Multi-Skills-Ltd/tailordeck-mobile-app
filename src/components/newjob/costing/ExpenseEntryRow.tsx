import { Plus } from 'lucide-react'
import { digitsOnly, formatNairaInput } from '../newJobConfig'

export function ExpenseEntryRow({
  expenseDraftCost,
  expenseDraftName,
  onAddExpense,
  onExpenseDraftCostChange,
  onExpenseDraftNameChange,
}: {
  expenseDraftName: string
  expenseDraftCost: string
  onExpenseDraftNameChange: (value: string) => void
  onExpenseDraftCostChange: (value: string) => void
  onAddExpense: () => void
}) {
  return (
    <div className="wizard-expense-entry-row">
      <input
        className="input wizard-expense-name-input"
        value={expenseDraftName}
        onChange={(event) => onExpenseDraftNameChange(event.target.value)}
        placeholder="Expense name (e.g. Transport)"
      />
      <input
        className="input wizard-expense-cost-input"
        value={formatNairaInput(expenseDraftCost)}
        onChange={(event) => onExpenseDraftCostChange(digitsOnly(event.target.value))}
        placeholder={formatNairaInput('0')}
        inputMode="numeric"
      />
      <button type="button" className="wizard-expense-add-btn" onClick={onAddExpense} aria-label="Add expense">
        <Plus size={22} />
      </button>
    </div>
  )
}
