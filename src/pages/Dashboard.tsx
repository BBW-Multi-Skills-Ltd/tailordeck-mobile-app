import { BriefcaseBusiness, ChevronLeft, ChevronRight, DollarSign, ReceiptText, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { mockJobs } from '../data/mockJobs'
import { formatNaira } from '../lib/utils'

type MonthStat = {
  key: string
  label: string
  revenue: number
  expenses: number
  profit: number
}

function monthKey(date: string): string {
  const parsed = new Date(date)
  const y = parsed.getFullYear()
  const m = parsed.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-NG', { month: 'short' })
}

export default function Dashboard() {
  const [monthOffset, setMonthOffset] = useState(0)

  const metrics = useMemo(() => {
    const sortedJobs = [...mockJobs].sort((a, b) => (a.createdDate > b.createdDate ? 1 : -1))
    const latestDate = sortedJobs.length ? new Date(sortedJobs[sortedJobs.length - 1].createdDate) : new Date()

    const monthWindow: Date[] = []
    for (let i = 5; i >= 0; i -= 1) {
      monthWindow.push(new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1))
    }
    const monthKeys = monthWindow.map((date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    const monthSet = new Set(monthKeys)

    const monthMap = new Map<string, MonthStat>(
      monthKeys.map((key) => [key, { key, label: monthLabel(key), revenue: 0, expenses: 0, profit: 0 }]),
    )

    for (const job of mockJobs) {
      const key = monthKey(job.createdDate)
      if (!monthSet.has(key)) continue
      const existing = monthMap.get(key)
      if (!existing) continue

      const expenseRatio = job.status === 'Completed' ? 0.36 : job.status === 'In Progress' ? 0.32 : 0.28
      const expenseEstimate = Math.round(job.chargeAmount * expenseRatio)
      existing.revenue += job.chargeAmount
      existing.expenses += expenseEstimate
      existing.profit += job.chargeAmount - expenseEstimate
    }

    const months = monthKeys.map((key) => monthMap.get(key)!)
    const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0)
    const totalExpenses = months.reduce((sum, month) => sum + month.expenses, 0)
    const totalProfit = totalRevenue - totalExpenses

    const bestMonth = months.reduce<MonthStat | null>((best, month) => {
      if (!best) return month
      return month.profit > best.profit ? month : best
    }, null)

    const currentMonthKey = monthKeys[monthKeys.length - 1]
    const currentMonthJobs = mockJobs.filter((job) => monthKey(job.createdDate) === currentMonthKey)
    const statusCounts = {
      completed: currentMonthJobs.filter((job) => job.status === 'Completed').length,
      inProgress: currentMonthJobs.filter((job) => job.status === 'In Progress').length,
      pending: currentMonthJobs.filter((job) => job.status === 'Pending').length,
    }

    return { months, totalRevenue, totalExpenses, totalProfit, bestMonth, statusCounts, totalJobs: currentMonthJobs.length, latestDate }
  }, [])

  const statusTotal = metrics.statusCounts.completed + metrics.statusCounts.inProgress + metrics.statusCounts.pending
  const visibleMonth = new Date(metrics.latestDate.getFullYear(), metrics.latestDate.getMonth() + monthOffset, 1)
  const visibleMonthLabel = visibleMonth.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
  const chartMax = Math.max(...metrics.months.map((item) => Math.max(item.revenue, item.expenses)), 1000)
  const yTicks = [0, 85000, 170000, 255000, 340000]
  const pieData = [
    { name: 'Completed', value: metrics.statusCounts.completed, color: '#7B1E37' },
    { name: 'In Progress', value: metrics.statusCounts.inProgress, color: '#C9A84C' },
    { name: 'Pending', value: metrics.statusCounts.pending, color: '#2C78C2' },
  ]

  return (
    <section className="section stack gap-14">
      <header>
        <h1>Dashboard</h1>
      </header>

      <div className="dashboard-month-nav">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setMonthOffset((prev) => prev - 1)}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="dashboard-month-label">{visibleMonthLabel}</p>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setMonthOffset((prev) => Math.min(prev + 1, 0))}
          aria-label="Next month"
          disabled={monthOffset === 0}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="kpi-grid">
        <article className="card dashboard-kpi-card">
          <BriefcaseBusiness size={20} className="text-primary" />
          <p className="dashboard-kpi-value">{metrics.totalJobs}</p>
          <p className="dashboard-kpi-label">Total Jobs</p>
        </article>
        <article className="card dashboard-kpi-card">
          <DollarSign size={20} className="text-success" />
          <p className="dashboard-kpi-value">{formatNaira(metrics.totalRevenue)}</p>
          <p className="dashboard-kpi-label">Revenue</p>
        </article>
        <article className="card dashboard-kpi-card">
          <ReceiptText size={20} className="text-gold" />
          <p className="dashboard-kpi-value">{formatNaira(metrics.totalExpenses)}</p>
          <p className="dashboard-kpi-label">Expenses</p>
        </article>
        <article className="card dashboard-kpi-card">
          <TrendingUp size={20} className={metrics.totalProfit >= 0 ? 'text-success' : 'text-danger'} />
          <p className="dashboard-kpi-value">{formatNaira(metrics.totalProfit)}</p>
          <p className="dashboard-kpi-label">Net Profit</p>
        </article>
      </div>

      <article className="card stack gap-12">
        <h3 className="dashboard-section-title">Last 6 Months</h3>
        <div className="dashboard-chart-wrap">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={metrics.months} barGap={4} margin={{ top: 8, right: 8, left: -14, bottom: 4 }}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8A7060', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, chartMax]}
                ticks={yTicks}
                tick={{ fill: '#8A7060', fontSize: 11 }}
                tickFormatter={(value) => `₦${Math.round(value / 1000)}k`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(138, 112, 96, 0.08)' }}
                contentStyle={{ borderRadius: 14, border: '1px solid #E8E0D8', fontSize: 12 }}
                formatter={(value, name) => [formatNaira(Number(value ?? 0)), String(name) === 'revenue' ? 'Revenue' : 'Expenses']}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={22}>
                {metrics.months.map((month) => (
                  <Cell key={`${month.key}-rev`} fill="#7B1E37" />
                ))}
              </Bar>
              <Bar dataKey="expenses" radius={[8, 8, 0, 0]} maxBarSize={22}>
                {metrics.months.map((month) => (
                  <Cell key={`${month.key}-exp`} fill="#C9A84C" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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

      <article className="card stack gap-12">
        <h3 className="dashboard-section-title">Job Status Breakdown</h3>
        <div className="dashboard-status-layout">
          <div className="dashboard-status-chart">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={74}
                  startAngle={100}
                  endAngle={-260}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="#FFFFFF"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${Number(value ?? 0)}`, String(name)]}
                  contentStyle={{ borderRadius: 14, border: '1px solid #E8E0D8', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-status-legend">
            {pieData.map((item) => (
              <div key={item.name} className="row-between">
                <p className="text-base text-muted row gap-8">
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

      <article className="card dashboard-best-month-card">
        <p className="text-muted text-lg">Best month (last 6)</p>
        <p className="dashboard-best-month-text">
          {metrics.bestMonth?.label ?? '-'} - {formatNaira(metrics.bestMonth?.profit ?? 0)} profit
        </p>
      </article>
    </section>
  )
}
