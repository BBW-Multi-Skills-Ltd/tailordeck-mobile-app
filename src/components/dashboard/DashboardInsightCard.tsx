import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatNaira } from '../../lib/utils'
import type { DashboardMetrics } from './dashboardMetrics'

type DashboardInsightCardProps = {
  metrics: DashboardMetrics
}

export default function DashboardInsightCard({ metrics }: DashboardInsightCardProps) {
  const expenseRatio = metrics.totalRevenue > 0 ? Math.round((metrics.totalExpenses / metrics.totalRevenue) * 100) : 0
  const profitable = metrics.totalProfit >= 0
  const Icon = profitable ? TrendingUp : TrendingDown

  return (
    <article className="dashboard-insight-card card">
      <span className={`dashboard-insight-icon${profitable ? ' is-positive' : ' is-negative'}`}>
        <Icon size={18} />
      </span>
      <div className="stack gap-3 min-w-0">
        <h3>{profitable ? 'Your shop is profitable this month' : 'Costs are higher than revenue'}</h3>
        <p>
          {profitable
            ? `${formatNaira(metrics.totalProfit)} is left after expenses. Expenses are taking ${expenseRatio}% of revenue.`
            : `You are down ${formatNaira(Math.abs(metrics.totalProfit))}. Review pricing or reduce expenses before accepting similar jobs.`}
        </p>
      </div>
    </article>
  )
}
