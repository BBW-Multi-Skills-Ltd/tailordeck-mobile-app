import { formatNaira } from '../../lib/utils'
import type { MonthStat } from './dashboardMetrics'

type BestMonthCardProps = {
  bestMonth: MonthStat | null
}

export default function BestMonthCard({ bestMonth }: BestMonthCardProps) {
  return (
    <article className="card dashboard-best-month-card">
      <p className="text-muted text-lg">Best month (last 6)</p>
      <p className="dashboard-best-month-text">
        {bestMonth?.label ?? '-'} - {formatNaira(bestMonth?.profit ?? 0)} profit
      </p>
    </article>
  )
}
