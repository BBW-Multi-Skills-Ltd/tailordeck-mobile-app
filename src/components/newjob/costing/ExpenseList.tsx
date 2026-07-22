import { Trash2 } from 'lucide-react'
import { formatNaira } from '../../../lib/utils'
import { numericValue, type ExpenseForm } from '../newJobConfig'

export function ExpenseList({ expenses, onRemoveExpense }: { expenses: ExpenseForm[]; onRemoveExpense: (expenseId: string) => void }) {
  if (!expenses.length) return null

  return (
    <div className="stack gap-8">
      {expenses.map((expense) => (
        <article key={expense.id} className="card row-between">
          <div className="stack gap-4 min-w-0">
            <p className="text-sm text-heading truncate">{expense.name}</p>
            <p className="text-sm text-muted">{formatNaira(numericValue(expense.cost))}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon text-danger"
            onClick={() => onRemoveExpense(expense.id)}
            aria-label="Remove expense"
          >
            <Trash2 size={15} />
          </button>
        </article>
      ))}
    </div>
  )
}
