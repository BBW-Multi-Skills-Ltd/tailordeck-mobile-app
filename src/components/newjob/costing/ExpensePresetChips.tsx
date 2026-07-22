import { Plus, X } from 'lucide-react'
import { commonExpenseNames } from './costingConstants'

export function ExpensePresetChips({
  expenseDraftName,
  onExpenseDraftNameChange,
}: {
  expenseDraftName: string
  onExpenseDraftNameChange: (value: string) => void
}) {
  return (
    <div className="wizard-expense-chip-row">
      {commonExpenseNames.map((expenseName) => {
        const isSelected = expenseDraftName.trim().toLowerCase() === expenseName.toLowerCase()
        return (
          <button
            key={expenseName}
            type="button"
            className={`wizard-expense-chip${isSelected ? ' active' : ''}`}
            onClick={() => onExpenseDraftNameChange(isSelected ? '' : expenseName)}
            aria-pressed={isSelected}
          >
            {isSelected ? <X size={13} /> : <Plus size={13} />}
            {expenseName}
          </button>
        )
      })}
    </div>
  )
}
