import { formatNaira } from '../../lib/utils'
import type { MonthStat } from './dashboardMetrics'

type MonthlyPerformanceTableProps = {
  months: MonthStat[]
}

export default function MonthlyPerformanceTable({ months }: MonthlyPerformanceTableProps) {
  return (
    <article className="card stack gap-10">
      <h3 className="dashboard-section-title">Monthly Performance</h3>
      <div className="dashboard-performance-table-wrap">
        <table className="dashboard-performance-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Jobs</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {[...months].reverse().map((month) => (
              <tr key={`perf-${month.key}`}>
                <td>{month.fullLabel}</td>
                <td>{month.jobs}</td>
                <td>{formatNaira(month.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
