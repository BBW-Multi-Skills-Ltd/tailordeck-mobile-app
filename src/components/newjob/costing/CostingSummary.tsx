import { formatNaira } from '../../../lib/utils'

export function CostingSummary({
  charge,
  projectedProfit,
  totalExpenses,
}: {
  charge: number
  totalExpenses: number
  projectedProfit: number
}) {
  return (
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
  )
}
