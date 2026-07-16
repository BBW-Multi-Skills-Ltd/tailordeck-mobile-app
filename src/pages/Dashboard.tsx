import { BarChart3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import BestMonthCard from '../components/dashboard/BestMonthCard'
import DashboardKpiGrid from '../components/dashboard/DashboardKpiGrid'
import DashboardMonthNav from '../components/dashboard/DashboardMonthNav'
import DashboardRevenueChart from '../components/dashboard/DashboardRevenueChart'
import { buildDashboardMetricsFromStats } from '../components/dashboard/dashboardMetrics'
import JobStatusBreakdown from '../components/dashboard/JobStatusBreakdown'
import MonthlyPerformanceTable from '../components/dashboard/MonthlyPerformanceTable'
import EmptyState from '../components/shared/EmptyState'
import PageHeader from '../components/shared/PageHeader'
import { useJobStatusBreakdownQuery, useMonthlyStatsQuery } from '../hooks/useDashboardQueries'

export default function Dashboard() {
  const [monthOffset, setMonthOffset] = useState(0)
  const monthlyStatsQuery = useMonthlyStatsQuery()
  const statusQuery = useJobStatusBreakdownQuery()
  const monthlyStats = monthlyStatsQuery.data ?? []
  const statusCounts = statusQuery.data ?? { completed: 0, inProgress: 0, pending: 0 }
  const metrics = useMemo(() => buildDashboardMetricsFromStats(monthlyStats, statusCounts), [monthlyStats, statusCounts])
  const hasAnalytics = monthlyStats.some((month) => month.jobs > 0)
  const visibleMonth = new Date(metrics.latestDate.getFullYear(), metrics.latestDate.getMonth() + monthOffset, 1)
  const visibleMonthLabel = visibleMonth.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })

  return (
    <section className="section stack gap-14">
      <PageHeader title="Dashboard" centered />

      {monthlyStatsQuery.isLoading || statusQuery.isLoading ? (
        <div className="stack gap-12">
          <div className="dashboard-kpi-grid">
            <div className="skeleton" style={{ height: 112 }} />
            <div className="skeleton" style={{ height: 112 }} />
            <div className="skeleton" style={{ height: 112 }} />
            <div className="skeleton" style={{ height: 112 }} />
          </div>
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      ) : monthlyStatsQuery.isError || statusQuery.isError ? (
        <EmptyState
          icon={BarChart3}
          title="Unable to load analytics"
          description="Check your connection and Supabase policies for jobs, then refresh the page."
        />
      ) : !hasAnalytics ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Your dashboard will show revenue, expenses, profit, and job status once you create your first job."
          actionLabel="Create Job"
          actionTo="/jobs/new"
        />
      ) : null}

      {hasAnalytics ? (
        <>
          <DashboardMonthNav
            label={visibleMonthLabel}
            monthOffset={monthOffset}
            onPrevious={() => setMonthOffset((prev) => prev - 1)}
            onNext={() => setMonthOffset((prev) => Math.min(prev + 1, 0))}
          />
          <DashboardKpiGrid metrics={metrics} />
          <DashboardRevenueChart months={metrics.months} />
          <JobStatusBreakdown statusCounts={metrics.statusCounts} />
          <MonthlyPerformanceTable months={metrics.months} />
          <BestMonthCard bestMonth={metrics.bestMonth} />
        </>
      ) : null}
    </section>
  )
}
