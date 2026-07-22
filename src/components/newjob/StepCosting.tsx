import { PricingDepositFields } from './PricingDepositFields'
import { CostingSummary } from './costing/CostingSummary'
import { ExpenseEntryRow } from './costing/ExpenseEntryRow'
import { ExpenseList } from './costing/ExpenseList'
import { ExpensePresetChips } from './costing/ExpensePresetChips'
import type { StepCostingProps } from './costing/costingTypes'
import { WorthItSelector } from './costing/WorthItSelector'

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
        <ExpensePresetChips expenseDraftName={expenseDraftName} onExpenseDraftNameChange={onExpenseDraftNameChange} />
        <ExpenseEntryRow
          expenseDraftCost={expenseDraftCost}
          expenseDraftName={expenseDraftName}
          onAddExpense={onAddExpense}
          onExpenseDraftCostChange={onExpenseDraftCostChange}
          onExpenseDraftNameChange={onExpenseDraftNameChange}
        />
      </div>

      <ExpenseList expenses={expenses} onRemoveExpense={onRemoveExpense} />
      <CostingSummary charge={charge} projectedProfit={projectedProfit} totalExpenses={totalExpenses} />
      <WorthItSelector worthIt={worthIt} onWorthItChange={onWorthItChange} />
    </div>
  )
}
