import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DashboardMetrics } from './dashboardMetrics'

type JobStatusBreakdownProps = {
  statusCounts: DashboardMetrics['statusCounts']
}

export default function JobStatusBreakdown({ statusCounts }: JobStatusBreakdownProps) {
  const pieData = [
    { name: 'Completed', value: statusCounts.completed, color: '#7B1E37' },
    { name: 'In Progress', value: statusCounts.inProgress, color: '#C9A84C' },
    { name: 'Pending', value: statusCounts.pending, color: '#2C78C2' },
  ]
  const statusTotal = statusCounts.completed + statusCounts.inProgress + statusCounts.pending

  return (
    <article className="card stack gap-12">
      <h3 className="dashboard-section-title">Job Status Breakdown</h3>
      <div className="dashboard-status-layout">
        <div className="dashboard-status-chart">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={74} startAngle={100} endAngle={-260} paddingAngle={3} strokeWidth={2} stroke="var(--bg-card)">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--clay-surface)',
                  border: '1px solid var(--clay-border)',
                  borderRadius: 14,
                  boxShadow: 'var(--clay-shadow-rest)',
                  fontSize: 12,
                }}
                cursor={false}
                formatter={(value, name) => [`${Number(value ?? 0)}`, String(name)]}
                itemStyle={{ color: 'var(--text-muted)' }}
                labelStyle={{ color: 'var(--text)', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-status-legend">
          {pieData.map((item) => (
            <div key={item.name} className="row-between">
              <p className="text-sm text-muted row gap-8">
                <span className="dashboard-dot" style={{ background: item.color }} />
                {item.name}
              </p>
              <p className="dashboard-status-count">{item.value}</p>
            </div>
          ))}
          {statusTotal === 0 ? <p className="text-sm text-muted">No jobs yet for this month.</p> : null}
        </div>
      </div>
    </article>
  )
}
