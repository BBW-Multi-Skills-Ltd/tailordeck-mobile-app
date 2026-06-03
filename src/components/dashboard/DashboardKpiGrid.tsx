import { BriefcaseBusiness, ReceiptText, TrendingUp } from 'lucide-react'
import { formatNaira } from '../../lib/utils'
import type { DashboardMetrics } from './dashboardMetrics'

type DashboardKpiGridProps = {
  metrics: DashboardMetrics
}

export default function DashboardKpiGrid({ metrics }: DashboardKpiGridProps) {
  return (
    <div className="dashboard-kpi-grid">
      <article className="card dashboard-kpi-card">
        <BriefcaseBusiness size={20} className="dashboard-kpi-icon text-primary" />
        <p className="dashboard-kpi-value">{metrics.totalJobs}</p>
        <p className="dashboard-kpi-label">Total Jobs</p>
      </article>
      <article className="card dashboard-kpi-card">
        <span className="dashboard-kpi-icon dashboard-kpi-currency text-success" aria-hidden>
          {'\u20A6'}
        </span>
        <p className="dashboard-kpi-value">{formatNaira(metrics.totalRevenue)}</p>
        <p className="dashboard-kpi-label">Revenue</p>
      </article>
      <article className="card dashboard-kpi-card">
        <ReceiptText size={20} className="dashboard-kpi-icon text-gold" />
        <p className="dashboard-kpi-value">{formatNaira(metrics.totalExpenses)}</p>
        <p className="dashboard-kpi-label">Expenses</p>
      </article>
      <article className="card dashboard-kpi-card">
        <TrendingUp size={20} className={`dashboard-kpi-icon ${metrics.totalProfit >= 0 ? 'text-success' : 'text-danger'}`} />
        <p className="dashboard-kpi-value">{formatNaira(metrics.totalProfit)}</p>
        <p className="dashboard-kpi-label">Net Profit</p>
      </article>
    </div>
  )
}
