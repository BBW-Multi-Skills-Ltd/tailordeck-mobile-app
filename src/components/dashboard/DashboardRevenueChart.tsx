import { Bar, BarChart, Cell, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNaira } from '../../lib/utils'
import type { MonthStat } from './dashboardMetrics'

type DashboardRevenueChartProps = {
  months: MonthStat[]
}

const yTicks = [0, 85000, 170000, 255000, 340000]

export default function DashboardRevenueChart({ months }: DashboardRevenueChartProps) {
  const chartMax = Math.max(...months.map((item) => Math.max(item.revenue, item.expenses)), 1000)
  const chartTop = Math.max(chartMax, yTicks[yTicks.length - 1])
  const yTickLabels = [...yTicks].reverse().map((value) => `\u20A6${Math.round(value / 1000)}k`)

  return (
    <article className="card stack gap-12">
      <h3 className="dashboard-section-title">Last 6 Months</h3>
      <div className="dashboard-chart-wrap">
        <div className="dashboard-chart-layout">
          <div className="dashboard-y-ticks" aria-hidden="true">
            {yTickLabels.map((label) => (
              <span key={label} className="dashboard-y-tick-item">
                {label}
              </span>
            ))}
          </div>
          <div className="dashboard-chart-area">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart accessibilityLayer={false} data={months} barGap={4} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8A7060', fontSize: 12 }} />
                <YAxis hide domain={[0, chartTop]} />
                <Tooltip
                  cursor={
                    <Rectangle
                      radius={10}
                      fill="color-mix(in srgb, var(--primary) 12%, transparent)"
                      stroke="none"
                      strokeWidth={0}
                    />
                  }
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    boxShadow: 'var(--shadow-md)',
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [formatNaira(Number(value ?? 0)), String(name) === 'revenue' ? 'Revenue' : 'Expenses']}
                  itemStyle={{ color: 'var(--text-muted)', paddingBottom: 2, paddingTop: 2 }}
                  labelStyle={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={22} activeBar={false}>
                  {months.map((month) => (
                    <Cell key={`${month.key}-rev`} fill="#7B1E37" />
                  ))}
                </Bar>
                <Bar dataKey="expenses" radius={[8, 8, 0, 0]} maxBarSize={22} activeBar={false}>
                  {months.map((month) => (
                    <Cell key={`${month.key}-exp`} fill="#C9A84C" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboard-chart-legend">
          <span className="dashboard-legend-item">
            <span className="dashboard-dot dashboard-dot-revenue" />
            Revenue
          </span>
          <span className="dashboard-legend-item">
            <span className="dashboard-dot dashboard-dot-expenses" />
            Expenses
          </span>
        </div>
      </div>
    </article>
  )
}
