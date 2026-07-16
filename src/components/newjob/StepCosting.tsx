import { Check, Plus, Trash2, X } from 'lucide-react'
import { digitsOnly, formatNairaInput, numericValue, type ExpenseForm } from './newJobConfig'
import { formatNaira } from '../../lib/utils'
import { PricingDepositFields, type PricingDepositFieldsProps } from './PricingDepositFields'

const commonExpenseNames = [
  'Fuel',
  'Transport',
  'Thread',
  'Needle',
  'Material',
  'Gumstay',
  'Zip',
  'Buttons',
  'Lining',
  'Beads',
  'Embroidery',
  'Ironing',
  'Packaging',
  'Dispatch',
]

type StepCostingProps = PricingDepositFieldsProps & {
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

export default function StepCosting({
  balance,
  chargeAmount,
  expenseDraftName,
  expenseDraftCost,
  expenses,
  charge,
  deposit,
  depositPercent,
  depositPercentValue,
  totalExpenses,
  projectedProfit,
  worthIt,
  onChargeAmountChange,
  onDepositPercentChange,
  onDepositPercentKeyDown,
  onExpenseDraftNameChange,
  onExpenseDraftCostChange,
  onAddExpense,
  onRemoveExpense,
  onWorthItChange,
}: StepCostingProps) {
  return (
    <div className="stack gap-12">
      <section className="stack gap-10">
        <PricingDepositFields
          balance={balance}
          chargeAmount={chargeAmount}
          deposit={deposit}
          depositPercent={depositPercent}
          depositPercentValue={depositPercentValue}
          onChargeAmountChange={onChargeAmountChange}
          onDepositPercentChange={onDepositPercentChange}
          onDepositPercentKeyDown={onDepositPercentKeyDown}
        />
      </section>

      <div className="stack gap-8">
        <div className="stack gap-4">
          <p className="wizard-section-label">Expenses</p>
          <p className="text-sm text-muted wizard-helper-inline">Add job costs to see your take-home profit.</p>
        </div>
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
      </div>

      {expenses.length > 0 ? (
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
      ) : null}

      <div className="card stack gap-10 wizard-costing-summary">
        <div className="row-between">
          <p className="wizard-costing-label">Charge Amount</p>
          <p className="wizard-costing-value">{formatNaira(charge)}</p>
        </div>
        <div className="row-between">
          <p className="wizard-costing-label">Total Expenses</p>
          <p className="wizard-costing-value wizard-costing-expense">- {formatNaira(totalExpenses)}</p>
        </div>
        <div className="divider" />
        <div className="row-between">
          <p className="wizard-costing-profit-label">Estimated Profit</p>
          <p className={projectedProfit >= 0 ? 'wizard-costing-profit-positive' : 'wizard-costing-profit-negative'}>
            {formatNaira(projectedProfit)}
          </p>
        </div>
      </div>

      <div className="input-group">
        <span className="wizard-section-label">Is this job worth it?</span>
        <div className="wizard-worth-grid">
          <button
            type="button"
            className={`wizard-worth-btn${worthIt === 'Yes' ? ' active-yes' : ''}`}
            onClick={() => onWorthItChange('Yes')}
          >
            <Check size={16} />
            Yes, proceed
          </button>
          <button
            type="button"
            className={`wizard-worth-btn danger${worthIt === 'No' ? ' active-no' : ''}`}
            onClick={() => onWorthItChange('No')}
          >
            <X size={16} />
            Not worth it
          </button>
        </div>
        {worthIt === 'No' ? (
          <p className="text-sm text-danger">Consider revising price or reducing costs before finalizing.</p>
        ) : null}
      </div>
    </div>
  )
}

