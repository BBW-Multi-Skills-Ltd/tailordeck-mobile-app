import { CircleDollarSign, HandCoins, List, Receipt, TrendingUp, WalletCards } from 'lucide-react'
import type { ReactNode } from 'react'
import type { DetailedExpense } from '../../types/jobDetails'
import { formatNaira } from '../../lib/utils'

function PricingRow({
  icon,
  label,
  value,
  valueClassName = 'text-sm font-semibold',
}: {
  icon: ReactNode
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="row-between">
      <p className="text-sm text-muted row gap-4">
        {icon}
        {label}
      </p>
      <p className={valueClassName}>{value}</p>
    </div>
  )
}

export function JobPricingSection({
  chargeAmount,
  depositAmount,
  balanceToCollect,
  totalExpenses,
  estimatedProfit,
  expenses,
}: {
  chargeAmount: number
  depositAmount: number
  balanceToCollect: number
  totalExpenses: number
  estimatedProfit: number
  expenses: DetailedExpense[]
}) {
  return (
    <article className="card stack gap-10">
      <h4 className="row gap-8">
        <span className="text-primary">{'\u20A6'}</span>
        <span>Pricing</span>
      </h4>
      <div className="job-pricing-snapshot">
        <div>
          <span>Charge</span>
          <strong>{formatNaira(chargeAmount)}</strong>
        </div>
        <div>
          <span>Balance</span>
          <strong>{formatNaira(balanceToCollect)}</strong>
        </div>
        <div>
          <span>Profit</span>
          <strong className={estimatedProfit >= 0 ? 'text-success' : 'text-danger'}>{formatNaira(estimatedProfit)}</strong>
        </div>
      </div>
      <div className="stack gap-8">
        <PricingRow icon={<CircleDollarSign size={14} />} label="Charge Amount" value={formatNaira(chargeAmount)} />
        <PricingRow icon={<HandCoins size={14} />} label="Deposit Collected" value={formatNaira(depositAmount)} />
        <PricingRow icon={<WalletCards size={14} />} label="Amount to Collect After Job" value={formatNaira(balanceToCollect)} />
        <div className="divider" />
        <div className="stack gap-8">
          <p className="text-sm text-muted row gap-4">
            <List size={14} />
            Expenses List
          </p>
          {expenses.length ? (
            expenses.map((expense) => (
              <div key={expense.name} className="row-between">
                <p className="text-sm">{expense.name}</p>
                <p className="text-sm font-semibold">{formatNaira(expense.cost)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No expenses added yet.</p>
          )}
        </div>
        <div className="divider" />
        <PricingRow
          icon={<Receipt size={14} />}
          label="Expenses Cost"
          value={formatNaira(totalExpenses)}
          valueClassName="text-sm font-semibold text-danger"
        />
        <div className="row-between">
          <p className="text-sm font-semibold row gap-4">
            <TrendingUp size={14} />
            Estimated Profit
          </p>
          <p className={`text-sm font-semibold ${estimatedProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatNaira(estimatedProfit)}
          </p>
        </div>
      </div>
    </article>
  )
}

