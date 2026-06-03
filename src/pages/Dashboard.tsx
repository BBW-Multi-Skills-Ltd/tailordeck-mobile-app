import { BarChart3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import BestMonthCard from '../components/dashboard/BestMonthCard'
import DashboardKpiGrid from '../components/dashboard/DashboardKpiGrid'
import DashboardMonthNav from '../components/dashboard/DashboardMonthNav'
import DashboardRevenueChart from '../components/dashboard/DashboardRevenueChart'
import { buildDashboardMetrics } from '../components/dashboard/dashboardMetrics'
import JobStatusBreakdown from '../components/dashboard/JobStatusBreakdown'
import MonthlyPerformanceTable from '../components/dashboard/MonthlyPerformanceTable'
import EmptyState from '../components/shared/EmptyState'
import { appJobs } from '../data/appData'

export default function Dashboard() {
  const [monthOffset, setMonthOffset] = useState(0)
  const metrics = useMemo(() => buildDashboardMetrics(appJobs), [])
  const visibleMonth = new Date(metrics.latestDate.getFullYear(), metrics.latestDate.getMonth() + monthOffset, 1)
  const visibleMonthLabel = visibleMonth.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })

  return (
    <section className="section stack gap-14">
      <header className="row-between">
        <span style={{ width: '44px' }} />
        <h2 className="app-page-heading">Dashboard</h2>
        <span style={{ width: '44px' }} />
      </header>

      {appJobs.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Your dashboard will show revenue, expenses, profit, and job status once you create your first job."
          actionLabel="Create Job"
          actionTo="/jobs/new"
        />
      ) : null}

      {appJobs.length > 0 ? (
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
