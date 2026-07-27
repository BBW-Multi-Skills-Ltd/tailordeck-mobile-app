import { ArrowLeft, BarChart3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BestMonthCard from '../components/dashboard/BestMonthCard'
import DashboardEmptyGuide from '../components/dashboard/DashboardEmptyGuide'
import DashboardInsightCard from '../components/dashboard/DashboardInsightCard'
import DashboardKpiGrid from '../components/dashboard/DashboardKpiGrid'
import DashboardMonthNav from '../components/dashboard/DashboardMonthNav'
import DashboardRevenueChart from '../components/dashboard/DashboardRevenueChart'
import { buildDashboardMetricsFromStats } from '../components/dashboard/dashboardMetrics'
import JobStatusBreakdown from '../components/dashboard/JobStatusBreakdown'
import MonthlyPerformanceTable from '../components/dashboard/MonthlyPerformanceTable'
import EmptyState from '../components/shared/EmptyState'
import PageHeader from '../components/shared/PageHeader'
import { useJobStatusBreakdownQuery, useMonthlyStatsQuery } from '../hooks/useDashboardQueries'
import { useFeatureAccess } from '../hooks/useFeatureAccess'
import { featureKeys } from '../lib/features'

export default function Dashboard() {
  const [monthOffset, setMonthOffset] = useState(0)
  const analyticsAccess = useFeatureAccess(featureKeys.dashboardAnalytics)
  const analyticsUnlocked = analyticsAccess.data !== false
  const monthlyStatsQuery = useMonthlyStatsQuery(analyticsUnlocked)
  const statusQuery = useJobStatusBreakdownQuery(analyticsUnlocked)
  const monthlyStats = useMemo(() => monthlyStatsQuery.data ?? [], [monthlyStatsQuery.data])
  const statusCounts = useMemo(
    () => statusQuery.data ?? { completed: 0, inProgress: 0, pending: 0 },
    [statusQuery.data],
  )
  const metrics = useMemo(() => buildDashboardMetricsFromStats(monthlyStats, statusCounts), [monthlyStats, statusCounts])
  const hasAnalytics = monthlyStats.some((month) => month.jobs > 0)
  const visibleMonth = new Date(metrics.latestDate.getFullYear(), metrics.latestDate.getMonth() + monthOffset, 1)
  const visibleMonthLabel = visibleMonth.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })

  return (
    <section className="section stack dashboard-page">
      <PageHeader
        title="Dashboard"
        centered
        leading={
          <Link to="/more" className="btn btn-ghost btn-icon" aria-label="Back to more">
            <ArrowLeft size={18} />
          </Link>
        }
      />

      {analyticsAccess.isLoading ? (
        <div className="skeleton" style={{ height: 180 }} />
      ) : !analyticsUnlocked ? (
        <EmptyState
          icon={BarChart3}
          title="Analytics is a Pro tool"
          description="Upgrade to Pro to unlock revenue, expenses, profit trends, and job status analytics."
          actionLabel="View Plans"
          actionTo="/settings/subscription"
        />
      ) : monthlyStatsQuery.isLoading || statusQuery.isLoading ? (
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
        <DashboardEmptyGuide />
      ) : null}

      {analyticsUnlocked && hasAnalytics ? (
        <>
          <DashboardMonthNav
            label={visibleMonthLabel}
            monthOffset={monthOffset}
            onPrevious={() => setMonthOffset((prev) => prev - 1)}
            onNext={() => setMonthOffset((prev) => Math.min(prev + 1, 0))}
          />
          <DashboardKpiGrid metrics={metrics} />
          <DashboardInsightCard metrics={metrics} />
          <DashboardRevenueChart months={metrics.months} />
          <JobStatusBreakdown statusCounts={metrics.statusCounts} />
          <MonthlyPerformanceTable months={metrics.months} />
          <BestMonthCard bestMonth={metrics.bestMonth} />
        </>
      ) : null}
    </section>
  )
}
